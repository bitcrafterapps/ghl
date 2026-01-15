'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, prdApi, messagesApi } from '@/lib/builder-api';
import { getApiUrl } from '@/lib/api';
import { useGeneration } from '@/hooks/useSocket';
import { Sparkles } from 'lucide-react';
import { GenerationSpinnerModal } from '@/components/builder/GenerationSpinnerModal';
import { PrdGenerationModal } from '@/components/builder/PrdGenerationModal';

interface InterviewPhase {
  id: string;
  name: string;
  description: string;
}

const phases: InterviewPhase[] = [
  { id: 'vision', name: 'Vision', description: 'Define the core purpose' },
  { id: 'features', name: 'Features', description: 'List key functionality' },
  { id: 'users', name: 'Users', description: 'Identify target users' },
  { id: 'data', name: 'Data Model', description: 'Define data structure' },
  { id: 'auth', name: 'Authentication', description: 'Security requirements' },
  { id: 'integrations', name: 'Integrations', description: 'Third-party services' },
  { id: 'design', name: 'Design', description: 'Visual preferences' },
  { id: 'chat', name: 'Chat', description: 'Refine with AI' },
];

interface PrdGeneratorProps {
  projectId: string;
  project: any;
  initialMode: 'auto' | 'interview';
  onCancel: () => void;
  onComplete: () => void;
}

export function PrdGenerator({ projectId, project, initialMode, onCancel, onComplete }: PrdGeneratorProps) {
  const queryClient = useQueryClient();
  const { startGeneration, isGenerating: hookIsGenerating, logMessages } = useGeneration(projectId);

  const projectData = { project };
  const projectLoading = false; 

  const [viewState, setViewState] = useState<'auto' | 'interview' | 'complete'>(initialMode);
  const [prdId, setPrdId] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [question, setQuestion] = useState<string | null>(null);
  const [context, setContext] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentPhase, setCurrentPhase] = useState<string>('vision');
  const [progress, setProgress] = useState<number>(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [hasStartedBuilding, setHasStartedBuilding] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isGeneratingPrd, setIsGeneratingPrd] = useState<boolean>(false); // Prevents modal flicker
  const [isEnhancing, setIsEnhancing] = useState(false);

  const createPRDMutation = useMutation({
    mutationFn: async () => {
      const { prd } = await prdApi.create(projectId);
      return prd;
    },
    onSuccess: (prd) => {
      setPrdId(prd.id);
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: (error) => {
      console.log('Failed to create PRD:', error);
    },
  });

  const startInterviewMutation = useMutation({
    mutationFn: async (id: string) => {
      return prdApi.startInterview(id, description);
    },
    onSuccess: (result) => {
      setQuestion(result.question);
      setContext(result.context || '');
      setSuggestions(result.suggestions || []);
      setCurrentPhase(result.phase);
      setProgress(result.progress);
      setViewState('interview');
    },
    onError: (error: any) => {
      console.log('Failed to start interview:', error);
      alert(`Failed to start interview: ${error.message || 'Unknown error'}`);
      setViewState('auto'); 
    },
    retry: 0,
  });

  const autoGenerateMutation = useMutation({
    mutationFn: async (variables?: { prdId: string, description: string }) => {
      const targetPrdId = variables?.prdId || prdId;
      if (!targetPrdId) throw new Error('No PRD ID');
      return prdApi.generateFromDescription(targetPrdId, description);
    },
    onSuccess: (res) => {
      console.log('Generation successful:', res);
      setIsGeneratingPrd(false);
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setViewState('complete');
    },
    onError: (error: any) => {
      console.log('Auto-generation failed:', error);
      setIsGeneratingPrd(false);
      alert(`Failed to generate PRD: ${error.message || 'Unknown error'}`);
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (answer: string) => {
      if (!prdId) throw new Error('No PRD');
      return prdApi.submitAnswer(prdId, answer);
    },
    onSuccess: (result) => {
      if (result.isComplete) {
        setCurrentPhase('chat');
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      } else {
        setQuestion(result.question);
        setContext(result.context || '');
        setSuggestions(result.suggestions || []);
        setCurrentPhase(result.phase);
        setProgress(result.progress);
        setCurrentAnswer('');
      }
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!prdId) throw new Error('No PRD');
      return prdApi.chat(prdId, message);
    },
    onSuccess: (data) => {
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
    },
  });

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: msg }]);
    chatMutation.mutate(msg);
  };

  const handleEnhanceDescription = async () => {
    if (!description.trim()) {
      alert('Please enter a description first.');
      return;
    }
    
    setIsEnhancing(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();
      
      const response = await fetch(`${apiUrl}/api/v1/projects/enhance-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description })
      });
      
      if (!response.ok) {
        throw new Error('Failed to enhance description');
      }
      
      const data = await response.json();
      const enhanced = data.data?.enhancedDescription || data.enhancedDescription;
      
      if (enhanced) {
        setDescription(enhanced);
      }
    } catch (error) {
      console.error('Error enhancing description:', error);
      alert('Failed to enhance description. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  useEffect(() => {
    if (projectData?.project) {
      if (projectData.project.description && !description) {
        setDescription(projectData.project.description);
      }

      const existingPrds = projectData.project.prds || [];
      let effectivePrdId = prdId;
      
      if (existingPrds.length > 0) {
        const latestPrd = existingPrds[0];
        effectivePrdId = latestPrd.id;
        if (effectivePrdId !== prdId) {
             setPrdId(effectivePrdId);
        }
      } else if (!createPRDMutation.isPending && !createPRDMutation.isSuccess && !prdId) {
        createPRDMutation.mutate();
        return;
      }

      if (effectivePrdId && initialMode === 'interview') {
         if (viewState === 'interview' && !question && !startInterviewMutation.isPending && !startInterviewMutation.isSuccess) {
             startInterviewMutation.mutate(effectivePrdId);
         }
      }
    }
  }, [projectData, initialMode, viewState, question, prdId]);


  const handleAutoGenerate = async () => {
    console.log('handleAutoGenerate called. Description:', description.length, 'chars. PrdId:', prdId);
    if (!description.trim()) return;
    
    setIsGeneratingPrd(true); // Keep modal open during entire sequence
    
    let targetPrdId = prdId;
    
    if (!targetPrdId) {
      try {
        const prd = await createPRDMutation.mutateAsync();
        targetPrdId = prd.id;
        setPrdId(prd.id);
      } catch (error) {
        console.log('Failed to create PRD during auto-generate:', error);
        setIsGeneratingPrd(false);
        alert('Failed to initialize PRD. Please try again.');
        return;
      }
    }

    if (targetPrdId) {
       autoGenerateMutation.mutate({ prdId: targetPrdId, description });
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    submitAnswerMutation.mutate(currentAnswer);
  };

  const handleSkip = () => {
    submitAnswerMutation.mutate('Skip this question');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentAnswer((prev) => (prev ? `${prev}\n${suggestion}` : suggestion));
  };

  const handleStartBuilding = async () => {
    if (prdId) {
      setHasStartedBuilding(true);
      
      try {
        await messagesApi.createMessage(projectId, 'USER', 'Generate app based on this PRD');
      } catch (error) {
        console.log('Failed to create start message:', error);
      }

      await startGeneration('Generate based on PRD', prdId);
    }
  };
  
  const [generationDidStart, setGenerationDidStart] = useState(false);
  
  useEffect(() => {
    if (hasStartedBuilding && hookIsGenerating && !generationDidStart) {
      setGenerationDidStart(true);
    }
  }, [hasStartedBuilding, hookIsGenerating, generationDidStart]);
  
  useEffect(() => {
    if (hasStartedBuilding && generationDidStart && !hookIsGenerating) {
      onComplete();
    }
  }, [hasStartedBuilding, generationDidStart, hookIsGenerating, onComplete]);

  const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);
  const isSubmitting = submitAnswerMutation.isPending || autoGenerateMutation.isPending || startInterviewMutation.isPending;

  if (projectLoading || createPRDMutation.isPending) {
    return (
      <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // --- COMPLETE STATE ---
  if (viewState === 'complete') {
    return (
      <div className="w-full h-full bg-zinc-950 flex items-center justify-center overflow-y-auto p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">PRD Complete!</h1>
          <p className="text-zinc-400 mb-8">
            Your Product Requirements Document has been generated.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-semibold hover:bg-zinc-700 transition-colors"
            >
              Review PRD
            </button>
            <button
               onClick={handleStartBuilding}
               className="px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-sky-500 transition-all shadow-lg shadow-blue-500/20"
            >
              Start Building
            </button>
          </div>
        </div>
        
        <GenerationSpinnerModal 
           isOpen={hasStartedBuilding}
           projectName={projectData?.project?.name}
           logMessages={logMessages}
        />
      </div>
    );
  }

  // --- AUTO GENERATE STATE ---
  if (viewState === 'auto') {
    return (
      <div className="w-full h-full bg-zinc-950 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-2xl w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl p-8">
          <button 
            onClick={onCancel}
            className="text-zinc-500 hover:text-zinc-300 text-sm mb-6 flex items-center gap-2"
          >
            ← Back to selection
          </button>
          
          <h2 className="text-3xl font-bold text-white mb-2">Describe your App</h2>
          <p className="text-zinc-400 mb-8">
            Be as descriptive as possible. Mention features, user roles, design references, and technical requirements.
          </p>

          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g. A project management dashboard for creative agencies with task boards, time tracking, and client portals..."
              className="w-full px-5 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-6 text-lg min-h-[200px] pr-12"
            />
            <div className="absolute top-4 right-4">
              <button 
                onClick={handleEnhanceDescription}
                disabled={isEnhancing || !description.trim()}
                className={`p-2 rounded-lg transition-colors ${
                  isEnhancing 
                    ? 'bg-orange-500/50 text-white cursor-wait' 
                    : !description.trim()
                      ? 'bg-orange-500/30 text-white/50 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-400'
                }`}
                title="Enhance description with AI"
              >
                {isEnhancing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleAutoGenerate}
            disabled={!description.trim() || autoGenerateMutation.isPending || createPRDMutation.isPending}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl font-bold text-lg hover:from-blue-500 hover:to-sky-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {autoGenerateMutation.isPending || createPRDMutation.isPending ? (
              'Processing...'
            ) : (
              <>
                Generate Specification ⚡️
              </>
            )}
          </button>
           <PrdGenerationModal isOpen={isGeneratingPrd} />
        </div>
      </div>
    );
  }

  // --- INTERVIEW SKELETON / LOADING STATE ---
  const isInitializing = viewState === 'interview' && (!question || startInterviewMutation.isPending) && !startInterviewMutation.isSuccess;
  
  if (isInitializing) {
    return (
      <div className="w-full h-full bg-zinc-950 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-3xl animate-pulse">
           <div className="text-zinc-500 text-sm mb-6 flex items-center gap-2">
            <div className="h-4 w-32 bg-zinc-800 rounded"></div>
          </div>

          {/* Progress Bar Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
              <div className="h-4 w-16 bg-zinc-800 rounded"></div>
              <div className="h-4 w-8 bg-zinc-800 rounded"></div>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden"></div>
          </div>

          {/* Phase Indicators Skeleton */}
          <div className="flex justify-between mb-8 overflow-x-auto pb-2">
            {phases.map((phase) => (
              <div key={phase.id} className="flex flex-col items-center min-w-[60px]">
                <div className="w-8 h-8 rounded-full bg-zinc-800 mb-1"></div>
                <div className="h-3 w-12 bg-zinc-800 rounded hidden sm:block"></div>
              </div>
            ))}
          </div>

          {/* Question Card Skeleton */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8">
            <div className="mb-6">
              <div className="h-4 w-20 bg-zinc-800 rounded mb-4"></div>
              <div className="h-8 w-3/4 bg-zinc-800 rounded mb-4"></div>
              <div className="h-4 w-1/2 bg-zinc-800 rounded"></div>
            </div>

            {/* Suggestions Skeleton */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-32 bg-zinc-800 rounded-full"></div>
              ))}
            </div>

            {/* Answer Input Skeleton */}
            <div className="w-full h-40 bg-zinc-900 border border-zinc-700 rounded-lg mb-6"></div>

            {/* Actions Skeleton */}
            <div className="flex justify-between">
              <div className="h-10 w-20 bg-zinc-800 rounded-lg"></div>
              <div className="h-10 w-24 bg-zinc-800 rounded-lg"></div>
            </div>
          </div>
          
          <div className="mt-8 text-center pt-8 border-t border-zinc-800/50">
             <p className="text-zinc-500 mb-4 text-sm">Taking longer than expected?</p>
             <button 
               onClick={() => startInterviewMutation.mutate(prdId!)}
               className="text-blue-400 hover:text-blue-300 text-sm font-medium underline"
             >
               Retry Connection
             </button>
             <button 
               onClick={() => setViewState('auto')}
               className="ml-6 text-zinc-500 hover:text-zinc-300 text-sm"
             >
               Switch to Auto Mode
             </button>
          </div>
        </div>
      </div>
    );
  }
  
  // --- CHAT / REFINE STATE ---
  if (currentPhase === 'chat') {
    return (
      <div className="w-full h-full bg-zinc-950 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-3xl h-full flex flex-col">
          <button 
            onClick={onCancel}
            className="text-zinc-500 hover:text-zinc-300 text-sm mb-6 flex items-center gap-2"
          >
            ← Back to selection
          </button>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
              <span>Progress</span>
              <span>100%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-blue-600 to-sky-600 w-full" />
            </div>
          </div>

          {/* Phase Indicators */}
          <div className="flex justify-between mb-8 overflow-x-auto pb-2">
            {phases.map((phase, index) => (
              <div
                key={phase.id}
                className={`flex flex-col items-center min-w-[60px] ${
                  phase.id === currentPhase
                    ? 'text-blue-400'
                    : 'text-green-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 transition-all ${
                    phase.id === currentPhase
                      ? 'bg-blue-600 text-white scale-110'
                      : 'bg-green-600 text-white'
                  }`}
                >
                  {phase.id === 'chat' ? '💬' : '✓'}
                </div>
                <span className="text-xs hidden sm:block">{phase.name}</span>
              </div>
            ))}
          </div>

          {/* Chat Interface */}
          <div className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex flex-col min-h-[400px]">
             <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {/* Initial Assistant Message */}
                <div className="bg-zinc-800 p-3 rounded-lg rounded-tl-none max-w-[80%] border border-zinc-700/50">
                   <p className="text-zinc-200 text-sm">
                      I've drafted your PRD based on our interview! You can now ask me to refine any specific sections, add new requirements, or clarify details. When you're happy, click "Finish".
                   </p>
                </div>

                {chatHistory.map((msg, i) => (
                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-lg max-w-[80%] text-sm ${
                         msg.role === 'user' 
                           ? 'bg-blue-600 text-white rounded-tr-none' 
                           : 'bg-zinc-800 text-zinc-200 border border-zinc-700/50 rounded-tl-none'
                      }`}>
                         {msg.content}
                      </div>
                   </div>
                ))}
                
                {chatMutation.isPending && (
                   <div className="flex justify-start">
                      <div className="bg-zinc-800 p-3 rounded-lg rounded-tl-none border border-zinc-700/50">
                         <div className="flex gap-1">
                            <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                         </div>
                      </div>
                   </div>
                )}
             </div>

             <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask to refine user stories, add specific features..."
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                   onClick={handleSendChat}
                   disabled={!chatInput.trim() || chatMutation.isPending}
                   className="p-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 disabled:opacity-50"
                >
                   ↑
                </button>
             </div>
          </div>

          <div className="mt-6 flex justify-end">
             <button
                onClick={() => setViewState('complete')}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl font-bold hover:from-blue-500 hover:to-sky-500 shadow-lg shadow-blue-500/20"
             >
                Finish & Generate PRD →
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- INTERVIEW STATE ---
  return (
    <div className="w-full h-full bg-zinc-950 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
         <button 
            onClick={onCancel}
            className="text-zinc-500 hover:text-zinc-300 text-sm mb-6 flex items-center gap-2"
          >
            ← Back to selection
          </button>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-sky-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Phase Indicators */}
        <div className="flex justify-between mb-8 overflow-x-auto pb-2">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className={`flex flex-col items-center min-w-[60px] ${
                phase.id === currentPhase
                  ? 'text-blue-400'
                  : index < currentPhaseIndex
                  ? 'text-green-400'
                  : 'text-zinc-600'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 transition-all ${
                  phase.id === currentPhase
                    ? 'bg-blue-600 text-white scale-110'
                    : index < currentPhaseIndex
                    ? 'bg-green-600 text-white'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {index < currentPhaseIndex ? '✓' : index + 1}
              </div>
              <span className="text-xs hidden sm:block">{phase.name}</span>
            </div>
          ))}
        </div>

        {/* Question Card */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8">
          <div className="mb-6">
            <span className="text-sm text-blue-400 font-medium capitalize">{currentPhase}</span>
            <h2 className="text-2xl font-bold text-white mt-2">{question}</h2>
            {context && (
              <p className="text-zinc-400 text-sm mt-2">{context}</p>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 text-sm bg-zinc-700/50 text-zinc-300 rounded-full hover:bg-zinc-700 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Answer Input */}
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-6"
            rows={5}
            disabled={isSubmitting}
          />

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Skip
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer.trim() || isSubmitting}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              )}
              {isSubmitting ? 'Processing...' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
