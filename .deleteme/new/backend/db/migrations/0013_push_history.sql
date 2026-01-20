-- Push History Migration
-- Tracks all pushes to git repositories for history and conflict detection

CREATE TABLE IF NOT EXISTS threebears.push_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES threebears.projects(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES threebears.users(id) ON DELETE SET NULL,
    generation_id UUID REFERENCES threebears.generations(id) ON DELETE SET NULL,
    commit_sha VARCHAR(40) NOT NULL,
    commit_message TEXT NOT NULL,
    branch VARCHAR(100) NOT NULL,
    files_count INTEGER NOT NULL DEFAULT 0,
    pr_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for fast lookup by project
CREATE INDEX IF NOT EXISTS push_history_project_idx ON threebears.push_history(project_id);

-- Index for lookup by commit SHA (for conflict detection)
CREATE INDEX IF NOT EXISTS push_history_commit_sha_idx ON threebears.push_history(commit_sha);
