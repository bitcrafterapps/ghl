'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { X, Download, FileText, FileJson, Printer, FileUp, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  convertInchesToTwip,
} from 'docx';
import { saveAs } from 'file-saver';
import { getApiUrl } from '@/lib/api';

interface PrdDocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  content: any;
  projectName?: string;
}

// Generate Markdown from PRD content
function generateMarkdown(content: any, projectName?: string): string {
  const lines: string[] = [];
  
  // Title
  lines.push(`# ${content.overview?.name || projectName || 'Product Requirements Document'}`);
  lines.push('');
  lines.push(content.overview?.description || '');
  lines.push('');
  
  // Table of Contents
  lines.push('## Table of Contents');
  lines.push('1. [Objectives](#objectives)');
  lines.push('2. [Features](#features)');
  lines.push('3. [Target Users](#target-users)');
  lines.push('4. [Data Model](#data-model)');
  lines.push('5. [Authentication](#authentication)');
  lines.push('6. [Integrations](#integrations)');
  lines.push('7. [Design](#design)');
  lines.push('8. [Technical Requirements](#technical-requirements)');
  lines.push('9. [Success Metrics](#success-metrics)');
  lines.push('');
  
  // Objectives
  if (content.overview?.objectives?.length) {
    lines.push('## Objectives');
    content.overview.objectives.forEach((obj: string, i: number) => {
      lines.push(`${i + 1}. ${obj}`);
    });
    lines.push('');
  }
  
  // Features
  if (content.features?.length) {
    lines.push('## Features');
    lines.push('');
    content.features.forEach((feature: any) => {
      const priority = feature.priority ? `[${feature.priority.toUpperCase()}]` : '';
      const points = feature.storyPoints ? `(${feature.storyPoints} pts)` : '';
      lines.push(`### ${feature.name} ${priority} ${points}`);
      lines.push('');
      lines.push(feature.description || '');
      lines.push('');
      if (feature.acceptanceCriteria) {
        lines.push('**Acceptance Criteria:**');
        lines.push(feature.acceptanceCriteria);
        lines.push('');
      }
      if (feature.userStories?.length) {
        lines.push('**User Stories:**');
        feature.userStories.forEach((story: string) => {
          lines.push(`- ${story}`);
        });
        lines.push('');
      }
    });
  }
  
  // Target Users
  if (content.targetUsers?.length) {
    lines.push('## Target Users');
    lines.push('');
    content.targetUsers.forEach((user: any) => {
      lines.push(`### ${user.persona}`);
      if (user.needs?.length) {
        lines.push('**Needs:**');
        user.needs.forEach((need: string) => {
          lines.push(`- ${need}`);
        });
      }
      lines.push('');
    });
  }
  
  // Data Model
  if (content.dataModel?.length) {
    lines.push('## Data Model');
    lines.push('');
    content.dataModel.forEach((entity: any) => {
      lines.push(`### ${entity.entity}`);
      lines.push('');
      if (entity.attributes?.length) {
        lines.push('| Field | Type | Required |');
        lines.push('|-------|------|----------|');
        entity.attributes.forEach((attr: any) => {
          lines.push(`| ${attr.name} | ${attr.type} | ${attr.required ? 'Yes' : 'No'} |`);
        });
        lines.push('');
      }
      if (entity.relationships?.length) {
        lines.push('**Relationships:**');
        entity.relationships.forEach((rel: any) => {
          lines.push(`- → ${rel.target} (${rel.type})`);
        });
        lines.push('');
      }
    });
  }
  
  // Authentication
  if (content.authentication) {
    lines.push('## Authentication');
    lines.push('');
    if (content.authentication.methods?.length) {
      lines.push('**Methods:**');
      content.authentication.methods.forEach((method: string) => {
        lines.push(`- ${method}`);
      });
      lines.push('');
    }
    if (content.authentication.roles?.length) {
      lines.push('**Roles:**');
      content.authentication.roles.forEach((role: any) => {
        const perms = Array.isArray(role.permissions) ? role.permissions.join(', ') : role.permissions;
        lines.push(`- **${role.name}**: ${perms}`);
      });
      lines.push('');
    }
  }
  
  // Integrations
  if (content.integrations?.length) {
    lines.push('## Integrations');
    lines.push('');
    lines.push('| Service | Purpose |');
    lines.push('|---------|---------|');
    content.integrations.forEach((int: any) => {
      lines.push(`| ${int.service} | ${int.purpose} |`);
    });
    lines.push('');
  }
  
  // Design
  if (content.design) {
    lines.push('## Design');
    lines.push('');
    if (content.design.style?.visualStyle) {
      lines.push(`**Visual Style:** ${content.design.style.visualStyle}`);
      lines.push('');
    }
    if (content.design.style?.themeMode) {
      lines.push(`**Theme Mode:** ${content.design.style.themeMode}`);
      lines.push('');
    }
    if (content.design.colors && typeof content.design.colors === 'object' && !Array.isArray(content.design.colors)) {
      const colorEntries = Object.entries(content.design.colors).map(([k, v]) => `${k}: ${v}`).join(', ');
      lines.push(`**Color Palette:** ${colorEntries}`);
      lines.push('');
    } else if (Array.isArray(content.design.colors) && content.design.colors.length > 0) {
      lines.push(`**Color Palette:** ${content.design.colors.join(', ')}`);
      lines.push('');
    }
    if (content.design.inspirations?.length) {
      lines.push(`**Inspirations:** ${content.design.inspirations.join(', ')}`);
      lines.push('');
    }
  }
  
  // Technical Requirements
  if (content.technicalRequirements) {
    lines.push('## Technical Requirements');
    lines.push('');
    if (content.technicalRequirements.platforms?.length) {
      lines.push(`**Platforms:** ${content.technicalRequirements.platforms.join(', ')}`);
      lines.push('');
    }
    if (content.technicalRequirements.performance?.length) {
      lines.push('**Performance:**');
      content.technicalRequirements.performance.forEach((p: string) => {
        lines.push(`- ${p}`);
      });
      lines.push('');
    }
    if (content.technicalRequirements.security?.length) {
      lines.push('**Security:**');
      content.technicalRequirements.security.forEach((s: string) => {
        lines.push(`- ${s}`);
      });
      lines.push('');
    }
  }
  
  // Success Metrics
  if (content.successMetrics?.length) {
    lines.push('## Success Metrics');
    lines.push('');
    content.successMetrics.forEach((metric: string) => {
      lines.push(`- ${metric}`);
    });
    lines.push('');
  }
  
  lines.push('---');
  lines.push(`*Generated on ${new Date().toLocaleDateString()}*`);
  
  return lines.join('\n');
}

export function PrdDocumentDrawer({ isOpen, onClose, content, projectName }: PrdDocumentDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [googleOAuthEnabled, setGoogleOAuthEnabled] = useState(false);
  const [isExportingToGoogle, setIsExportingToGoogle] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if Google OAuth is configured
    const checkGoogleOAuth = async () => {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/v1/google/status`);
        if (res.ok) {
          const data = await res.json();
          setGoogleOAuthEnabled(data.configured);
        }
      } catch (error) {
        console.error('Error checking Google OAuth status:', error);
      }
    };

    checkGoogleOAuth();
  }, []);

  if (!isOpen || !mounted) return null;
  
  const downloadMarkdown = () => {
    const md = generateMarkdown(content, projectName);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.overview?.name || projectName || 'PRD'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const downloadJSON = () => {
    const json = JSON.stringify(content, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.overview?.name || projectName || 'PRD'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handlePrint = () => {
    window.print();
  };

  const openInGoogleDoc = async () => {
    const docTitle = content.overview?.name || projectName || 'Product Requirements Document';

    // Helper to create a table with borders
    const createTable = (headers: string[], rows: string[][]) => {
      const borderStyle = {
        style: BorderStyle.SINGLE,
        size: 1,
        color: '999999',
      };

      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            children: headers.map(header =>
              new TableCell({
                width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
                shading: { fill: 'E8E8E8' },
                borders: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
                children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })],
              })
            ),
          }),
          ...rows.map(row =>
            new TableRow({
              children: row.map(cell =>
                new TableCell({
                  width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
                  borders: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
                  children: [new Paragraph({ text: cell })],
                })
              ),
            })
          ),
        ],
      });
    };

    // Build document sections
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(
      new Paragraph({
        text: docTitle,
        heading: HeadingLevel.TITLE,
        spacing: { after: 200 },
      })
    );

    // Description
    if (content.overview?.description) {
      children.push(
        new Paragraph({
          text: content.overview.description,
          spacing: { after: 400 },
        })
      );
    }

    // Objectives
    if (content.overview?.objectives?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Objectives',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
      content.overview.objectives.forEach((obj: string, i: number) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `${i + 1}. ${obj}` })],
            spacing: { after: 100 },
          })
        );
      });
    }

    // Features
    if (content.features?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Features',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      content.features.forEach((feature: any) => {
        const priority = feature.priority ? ` [${feature.priority.toUpperCase()}]` : '';
        const points = feature.storyPoints ? ` (${feature.storyPoints} pts)` : '';

        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: feature.name, bold: true }),
              new TextRun({ text: priority, italics: true }),
              new TextRun({ text: points }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );

        if (feature.description) {
          children.push(
            new Paragraph({
              text: feature.description,
              spacing: { after: 100 },
            })
          );
        }

        if (feature.acceptanceCriteria) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: 'Acceptance Criteria:', bold: true })],
              spacing: { before: 100 },
            })
          );
          if (Array.isArray(feature.acceptanceCriteria)) {
            feature.acceptanceCriteria.forEach((ac: any) => {
              children.push(
                new Paragraph({
                  text: `• ${ac.text ?? ac}`,
                  spacing: { after: 50 },
                })
              );
            });
          } else {
            children.push(
              new Paragraph({
                text: feature.acceptanceCriteria,
                spacing: { after: 100 },
              })
            );
          }
        }

        if (feature.userStories?.length > 0) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: 'User Stories:', bold: true })],
              spacing: { before: 100 },
            })
          );
          feature.userStories.forEach((story: string) => {
            children.push(
              new Paragraph({
                text: `• ${story}`,
                spacing: { after: 50 },
              })
            );
          });
        }
      });
    }

    // Target Users
    if (content.targetUsers?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Target Users',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      content.targetUsers.forEach((user: any) => {
        children.push(
          new Paragraph({
            text: user.persona,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
        if (user.needs?.length > 0) {
          user.needs.forEach((need: string) => {
            children.push(
              new Paragraph({
                text: `• ${need}`,
                spacing: { after: 50 },
              })
            );
          });
        }
      });
    }

    // Data Model
    if (content.dataModel?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Data Model',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      content.dataModel.forEach((entity: any) => {
        children.push(
          new Paragraph({
            text: entity.entity,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );

        if (entity.attributes?.length > 0) {
          const rows = entity.attributes.map((attr: any) => [
            attr.name,
            attr.type,
            attr.required ? 'Yes' : 'No',
          ]);
          children.push(createTable(['Field', 'Type', 'Required'], rows));
        }

        if (entity.relationships?.length > 0) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: 'Relationships:', bold: true })],
              spacing: { before: 100 },
            })
          );
          entity.relationships.forEach((rel: any) => {
            children.push(
              new Paragraph({
                text: `• → ${rel.target} (${rel.type})`,
                spacing: { after: 50 },
              })
            );
          });
        }
      });
    }

    // API Endpoints
    if (content.apiEndpoints?.length > 0) {
      children.push(
        new Paragraph({
          text: 'API Endpoints',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      const rows = content.apiEndpoints.map((ep: any) => [
        ep.method,
        ep.path,
        ep.description || '',
      ]);
      children.push(createTable(['Method', 'Path', 'Description'], rows));
    }

    // Authentication
    if (content.authentication) {
      children.push(
        new Paragraph({
          text: 'Authentication',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      if (content.authentication.methods?.length > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Methods:', bold: true })],
            spacing: { after: 100 },
          })
        );
        content.authentication.methods.forEach((method: string) => {
          children.push(
            new Paragraph({
              text: `• ${method}`,
              spacing: { after: 50 },
            })
          );
        });
      }

      if (content.authentication.roles?.length > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Roles & Permissions:', bold: true })],
            spacing: { before: 100, after: 100 },
          })
        );
        content.authentication.roles.forEach((role: any) => {
          const perms = Array.isArray(role.permissions) ? role.permissions.join(', ') : role.permissions;
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${role.name}: `, bold: true }),
                new TextRun({ text: perms }),
              ],
              spacing: { after: 50 },
            })
          );
        });
      }
    }

    // Integrations
    if (content.integrations?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Integrations',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      const rows = content.integrations.map((int: any) => [int.service, int.purpose]);
      children.push(createTable(['Service', 'Purpose'], rows));
    }

    // Design
    if (content.design) {
      children.push(
        new Paragraph({
          text: 'Design',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      if (content.design.style?.visualStyle) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Visual Style: ', bold: true }),
              new TextRun({ text: content.design.style.visualStyle }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      if (content.design.style?.themeMode) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Theme Mode: ', bold: true }),
              new TextRun({ text: content.design.style.themeMode }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      if (content.design.inspirations?.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Inspirations: ', bold: true }),
              new TextRun({ text: content.design.inspirations.join(', ') }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    }

    // Technical Requirements
    if (content.technicalRequirements) {
      children.push(
        new Paragraph({
          text: 'Technical Requirements',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      if (content.technicalRequirements.platforms?.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Platforms: ', bold: true }),
              new TextRun({ text: content.technicalRequirements.platforms.join(', ') }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      if (content.technicalRequirements.performance?.length > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Performance:', bold: true })],
            spacing: { before: 100 },
          })
        );
        content.technicalRequirements.performance.forEach((p: string) => {
          children.push(
            new Paragraph({
              text: `• ${p}`,
              spacing: { after: 50 },
            })
          );
        });
      }

      if (content.technicalRequirements.security?.length > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Security:', bold: true })],
            spacing: { before: 100 },
          })
        );
        content.technicalRequirements.security.forEach((s: string) => {
          children.push(
            new Paragraph({
              text: `• ${s}`,
              spacing: { after: 50 },
            })
          );
        });
      }
    }

    // Success Metrics
    if (content.successMetrics?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Success Metrics',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      content.successMetrics.forEach((metric: string) => {
        children.push(
          new Paragraph({
            text: `• ${metric}`,
            spacing: { after: 50 },
          })
        );
      });
    }

    // Footer
    children.push(
      new Paragraph({
        text: `Generated on ${new Date().toLocaleDateString()}`,
        spacing: { before: 400 },
        alignment: AlignmentType.CENTER,
      })
    );

    // Create the document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children,
      }],
    });

    // If Google OAuth is enabled, use the OAuth flow
    if (googleOAuthEnabled) {
      setIsExportingToGoogle(true);
      try {
        const token = localStorage.getItem('token');
        const apiUrl = getApiUrl();

        const res = await fetch(`${apiUrl}/api/v1/google/auth/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            redirectUrl: window.location.href,
            prdContent: content,
            projectName
          })
        });

        if (res.ok) {
          const data = await res.json();
          // Redirect to Google OAuth
          window.location.href = data.authUrl;
        } else {
          throw new Error('Failed to initiate Google OAuth');
        }
      } catch (error) {
        console.error('Error exporting to Google Docs:', error);
        alert('Failed to export to Google Docs. Please try again.');
        setIsExportingToGoogle(false);
      }
      return;
    }

    // Fallback: Generate and save the file as docx
    const blob = await Packer.toBlob(doc);
    const fileName = `${docTitle.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    saveAs(blob, fileName);

    // Open Google Docs import page
    window.open('https://docs.google.com/', '_blank');
  };

  // Calculate total story points
  const totalPoints = content.features?.reduce((sum: number, f: any) => sum + (f.storyPoints || 0), 0) || 0;
  const featureCount = content.features?.length || 0;
  
  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-3xl bg-zinc-900 border-l border-zinc-700 shadow-2xl z-[101] flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700 bg-zinc-900/95 backdrop-blur sticky top-0">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">PRD Document</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openInGoogleDoc}
              disabled={!googleOAuthEnabled || isExportingToGoogle}
              title={!googleOAuthEnabled ? 'Google Docs integration not configured. Contact your administrator.' : 'Export to Google Docs'}
              className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm",
                googleOAuthEnabled
                  ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300"
                  : "bg-zinc-700/50 text-zinc-500 cursor-not-allowed"
              )}
            >
              {isExportingToGoogle ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileUp className="w-4 h-4" />
              )}
              Google Doc
            </button>
            <button
              onClick={downloadMarkdown}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Markdown
            </button>
            <button
              onClick={downloadJSON}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-sm"
            >
              <FileJson className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-sm"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-8 print:p-4">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Title Section */}
            <div className="text-center pb-8 border-b border-zinc-700">
              <h1 className="text-4xl font-bold text-white mb-4">
                {content.overview?.name || projectName || 'Product Requirements Document'}
              </h1>
              <div className="text-xl text-zinc-400 leading-relaxed text-left">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-5 text-zinc-400">{children}</p>,
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    ul: ({ children }) => <ul className="my-6 space-y-4 list-disc list-inside">{children}</ul>,
                    li: ({ children }) => <li className="text-zinc-400">{children}</li>,
                  }}
                >
                  {content.overview?.description || ''}
                </ReactMarkdown>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center justify-center gap-8 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{content.epics?.length || 1}</p>
                  <p className="text-xs text-zinc-500 uppercase">Epics</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{featureCount}</p>
                  <p className="text-xs text-zinc-500 uppercase">Features</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{totalPoints}</p>
                  <p className="text-xs text-zinc-500 uppercase">Story Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{content.dataModel?.length || 0}</p>
                  <p className="text-xs text-zinc-500 uppercase">Entities</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">{content.apiEndpoints?.length || 0}</p>
                  <p className="text-xs text-zinc-500 uppercase">APIs</p>
                </div>
              </div>
            </div>
            
            {/* Objectives */}
            {content.overview?.objectives?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">1</span>
                  Objectives
                </h2>
                <div className="space-y-2 pl-10">
                  {content.overview.objectives.map((obj: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 text-zinc-300">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Features grouped by Epics */}
            {content.features?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">2</span>
                  Features
                </h2>
                <div className="space-y-6 pl-10">
                  {(content.epics || [{ id: 'epic-1', name: 'EPIC 1' }]).map((epic: any, epicIdx: number) => {
                    const epicFeatures = content.features.filter((f: any) => 
                      f.epicId === epic.id || (!f.epicId && epicIdx === 0)
                    );
                    if (epicFeatures.length === 0) return null;
                    
                    const epicPoints = epicFeatures.reduce((sum: number, f: any) => sum + (f.storyPoints || 0), 0);
                    
                    return (
                      <div key={epic.id} className="border-l-2 border-blue-500/50 pl-4">
                        <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
                          {epic.name}
                          <span className="text-xs text-blue-400/70 font-normal">
                            ({epicFeatures.length} features • {epicPoints} pts)
                          </span>
                        </h3>
                        <div className="space-y-4">
                          {epicFeatures.map((feature: any, i: number) => (
                            <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <h4 className="font-semibold text-white">{feature.name}</h4>
                                <div className="flex items-center gap-2 shrink-0">
                                  {feature.priority && (
                                    <span className={clsx(
                                      'px-2 py-0.5 rounded text-xs font-medium',
                                      feature.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                                      feature.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                      'bg-green-500/20 text-green-300'
                                    )}>
                                      {feature.priority}
                                    </span>
                                  )}
                                  {feature.storyPoints && (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
                                      {feature.storyPoints} pts
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-zinc-400 text-sm mb-3 whitespace-pre-wrap">{feature.description}</p>
                              {feature.acceptanceCriteria && (
                                <div className="mt-3 pt-3 border-t border-zinc-700/50">
                                  <p className="text-xs text-zinc-500 uppercase mb-2">Acceptance Criteria</p>
                                  <div className="text-zinc-400 text-sm whitespace-pre-wrap font-mono bg-zinc-900/50 p-3 rounded">
                                    {Array.isArray(feature.acceptanceCriteria) ? (
                                      <ul className="list-disc list-inside space-y-1">
                                        {feature.acceptanceCriteria.map((ac: any, idx: number) => (
                                          <li key={idx}>{ac.text ?? ac}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p>{feature.acceptanceCriteria}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
            
            {/* Target Users */}
            {content.targetUsers?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">3</span>
                  Target Users
                </h2>
                <div className="grid gap-4 md:grid-cols-2 pl-10">
                  {content.targetUsers.map((user: any, i: number) => (
                    <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                      <h3 className="font-semibold text-emerald-300 mb-2">{user.persona}</h3>
                      {user.needs?.length > 0 && (
                        <ul className="space-y-1">
                          {user.needs.map((need: string, j: number) => (
                            <li key={j} className="text-zinc-400 text-sm flex items-start gap-2">
                              <span className="text-emerald-500 mt-1">•</span>
                              {need}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Data Model */}
            {content.dataModel?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm">4</span>
                  Data Model
                </h2>
                <div className="space-y-4 pl-10">
                  {content.dataModel.map((entity: any, i: number) => (
                    <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                      <h3 className="font-semibold text-cyan-300 mb-3">{entity.entity}</h3>
                      {entity.attributes?.length > 0 && (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-zinc-500 border-b border-zinc-700">
                              <th className="pb-2">Field</th>
                              <th className="pb-2">Type</th>
                              <th className="pb-2">Required</th>
                            </tr>
                          </thead>
                          <tbody>
                            {entity.attributes.map((attr: any, j: number) => (
                              <tr key={j} className="border-b border-zinc-700/50">
                                <td className="py-2 text-white">{attr.name}</td>
                                <td className="py-2 text-cyan-400">{attr.type}</td>
                                <td className="py-2">
                                  {attr.required ? (
                                    <span className="text-orange-400">Yes</span>
                                  ) : (
                                    <span className="text-zinc-500">No</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* APIs */}
            {content.apiEndpoints?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm">5</span>
                  API Endpoints
                </h2>
                <div className="space-y-4 pl-10">
                  {content.apiEndpoints.map((endpoint: any, i: number) => (
                    <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={clsx(
                          'px-2 py-0.5 rounded text-xs font-bold uppercase',
                          endpoint.method === 'GET' ? 'bg-green-500/20 text-green-300' :
                          endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-300' :
                          endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-300' :
                          endpoint.method === 'PATCH' ? 'bg-orange-500/20 text-orange-300' :
                          endpoint.method === 'DELETE' ? 'bg-red-500/20 text-red-300' :
                          'bg-zinc-500/20 text-zinc-300'
                        )}>
                          {endpoint.method}
                        </span>
                        <code className="text-teal-300 text-sm font-mono">{endpoint.path}</code>
                      </div>
                      <p className="text-zinc-400 text-sm">{endpoint.description}</p>
                      {endpoint.entity && (
                        <p className="text-zinc-500 text-xs mt-1">Entity: {endpoint.entity}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Authentication */}
            {content.authentication && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-sm">6</span>
                  Authentication
                </h2>
                <div className="space-y-6 pl-10">
                  {content.authentication.methods?.length > 0 && (
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                      <h3 className="font-semibold text-red-300 mb-2">Methods</h3>
                      <ul className="space-y-1">
                        {content.authentication.methods.map((method: string, i: number) => (
                          <li key={i} className="text-zinc-400 text-sm flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            {method}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {content.authentication.roles?.length > 0 && (
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                      <h3 className="font-semibold text-red-300 mb-2">Roles & Permissions</h3>
                      <div className="space-y-3">
                        {content.authentication.roles.map((role: any, i: number) => (
                          <div key={i}>
                            <p className="text-white font-medium text-sm">{role.name}</p>
                            <p className="text-zinc-400 text-xs mt-1">
                              {Array.isArray(role.permissions) ? role.permissions.join(', ') : role.permissions}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Integrations */}
            {content.integrations?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm">6</span>
                  Integrations
                </h2>
                <div className="pl-10">
                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-zinc-500 border-b border-zinc-700">
                          <th className="pb-2">Service</th>
                          <th className="pb-2">Purpose</th>
                        </tr>
                      </thead>
                      <tbody>
                        {content.integrations.map((int: any, i: number) => (
                          <tr key={i} className="border-b border-zinc-700/50 last:border-0">
                            <td className="py-2 text-white font-medium">{int.service}</td>
                            <td className="py-2 text-zinc-400">{int.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* Design */}
            {content.design && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm">7</span>
                  Design
                </h2>
                <div className="grid gap-4 md:grid-cols-2 pl-10">
                  {content.design.style && (
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 md:col-span-2">
                      <h3 className="font-semibold text-pink-300 mb-3">Style & Theme</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {content.design.style.visualStyle && (
                          <div>
                            <p className="text-xs text-zinc-500 uppercase">Visual Style</p>
                            <p className="text-white text-sm">{content.design.style.visualStyle}</p>
                          </div>
                        )}
                        {content.design.style.themeMode && (
                          <div>
                            <p className="text-xs text-zinc-500 uppercase">Theme Mode</p>
                            <p className="text-white text-sm capitalize">{content.design.style.themeMode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(content.design.colors && (Array.isArray(content.design.colors) ? content.design.colors.length > 0 : Object.keys(content.design.colors).length > 0)) && (
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                      <h3 className="font-semibold text-pink-300 mb-3">Color Palette</h3>
                      <div className="space-y-2">
                        {Array.isArray(content.design.colors) ? (
                          content.design.colors.map((color: string, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded border border-zinc-600" style={{ backgroundColor: color }}></div>
                              <span className="text-zinc-400 text-sm">{color}</span>
                            </div>
                          ))
                        ) : (
                          Object.entries(content.design.colors).map(([name, value]: [string, any], i: number) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-zinc-400 text-sm capitalize">{name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500 text-xs">{value}</span>
                                <div className="w-4 h-4 rounded border border-zinc-600" style={{ backgroundColor: value }}></div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {content.design.inspirations?.length > 0 && (
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                      <h3 className="font-semibold text-pink-300 mb-3">Inspirations</h3>
                      <ul className="space-y-1">
                        {content.design.inspirations.map((item: string, i: number) => (
                          <li key={i} className="text-zinc-400 text-sm flex items-start gap-2">
                            <span className="text-pink-500 mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Technical Requirements */}
            {content.technicalRequirements && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm">8</span>
                  Technical Requirements
                </h2>
                <div className="space-y-4 pl-10">
                  {content.technicalRequirements.platforms?.length > 0 && (
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                      <h3 className="font-semibold text-sky-300 mb-2">Platforms</h3>
                      <p className="text-zinc-400 text-sm">
                        {content.technicalRequirements.platforms.join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    {content.technicalRequirements.performance?.length > 0 && (
                      <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                        <h3 className="font-semibold text-sky-300 mb-2">Performance</h3>
                        <ul className="space-y-1">
                          {content.technicalRequirements.performance.map((req: string, i: number) => (
                            <li key={i} className="text-zinc-400 text-sm flex items-start gap-2">
                              <span className="text-sky-500 mt-1">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {content.technicalRequirements.security?.length > 0 && (
                      <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                        <h3 className="font-semibold text-sky-300 mb-2">Security</h3>
                        <ul className="space-y-1">
                          {content.technicalRequirements.security.map((req: string, i: number) => (
                            <li key={i} className="text-zinc-400 text-sm flex items-start gap-2">
                              <span className="text-sky-500 mt-1">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Success Metrics */}
            {content.successMetrics?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm">9</span>
                  Success Metrics
                </h2>
                <div className="pl-10">
                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                    <ul className="space-y-2">
                      {content.successMetrics.map((metric: string, i: number) => (
                        <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">📈</span>
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}
            
            {/* Footer */}
            <div className="pt-8 border-t border-zinc-700 text-center text-zinc-500 text-sm">
              Generated on {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// Add animation styles to document
if (typeof document !== 'undefined') {
  const styleId = 'prd-drawer-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes slide-in-right {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      .animate-slide-in-right {
        animation: slide-in-right 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
  }
}
