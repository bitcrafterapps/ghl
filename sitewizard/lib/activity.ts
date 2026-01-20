export type ActivityType = 'proposal' | 'template' | 'company' | 'user' | 'gallery' | 'review';
export type ActivityAction = 'created' | 'updated' | 'deleted';

interface LogActivityOptions {
  type: ActivityType;
  action: ActivityAction;
  title: string;
  entityId: number;
}

export async function logActivity({ type, action, title, entityId }: LogActivityOptions): Promise<void> {
  try {
    console.log('🔍 Attempting to log activity:', { type, action, title, entityId });
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No authentication token found');
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log('📡 Making request to:', `${API_URL}/api/v1/activity/log`);

    const response = await fetch(`${API_URL}/api/v1/activity/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type,
        action,
        title,
        entityId
      })
    });

    const responseData = await response.json();
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', responseData);

    if (!response.ok) {
      console.error('❌ Failed to log activity:', responseData);
      throw new Error(responseData.error || 'Failed to log activity');
    } else {
      console.log('✅ Activity logged successfully');
    }
  } catch (error) {
    console.error('❌ Error logging activity:', error);
  }
} 