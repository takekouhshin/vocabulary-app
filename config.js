// デバッグモードフラグ（URLパラメータで制御可能）
const DEBUG = new URLSearchParams(window.location.search).get('debug') === 'true';

// GitHub設定
const GITHUB_CONFIG = {
    OWNER: 'takekouhshin',
    REPO: 'vocabulary-app',
    FILE_PATH: 'data.json',
    TOKEN: '' // GitHub Actionsから環境変数として注入
};

async function getFileFromGitHub() {
    try {
        if (DEBUG) console.log('API呼び出し開始:', {
            url: `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.FILE_PATH}`,
            timestamp: new Date().toISOString()
        });

        const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (DEBUG) console.log('APIレスポンス:', {
            status: response.status,
            headers: Object.fromEntries(response.headers)
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        if (DEBUG) console.log('取得データ:', data);

        return {
            content: JSON.parse(atob(data.content)),
            sha: data.sha
        };
    } catch (error) {
        console.error('エラー発生:', {
            message: error.message,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}

// GitHubにファイルを更新する関数
async function updateFileOnGitHub(content, sha) {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: '単語データの更新',
                content: btoa(JSON.stringify(content, null, 2)),
                sha: sha
            })
        });

        if (!response.ok) {
            throw new Error('更新に失敗しました');
        }

        return true;
    } catch (error) {
        console.error('GitHub API更新エラー:', error);
        return false;
    }
}