// デバッグモードフラグ
const DEBUG = new URLSearchParams(window.location.search).get('debug') === 'true';

// GitHub設定
const GITHUB_CONFIG = {
    OWNER: 'takekouhshin',
    REPO: 'vocabulary-app',
    FILE_PATH: 'data.json',
    TOKEN: ''
};

// 初期データ構造
const DEFAULT_DATA = {
    words: [],
    lastUpdate: new Date().toISOString()
};

async function getFileFromGitHub() {
    try {
        if (DEBUG) {
            console.log('API呼び出し設定:', {
                url: `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.FILE_PATH}`,
                hasToken: !!GITHUB_CONFIG.TOKEN
            });
        }

        // トークンがない場合は初期データを返す
        if (!GITHUB_CONFIG.TOKEN) {
            console.log('トークンが設定されていません。初期データを返します。');
            return { content: DEFAULT_DATA, sha: null };
        }

        const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            console.error('API応答エラー:', response.status);
            return { content: DEFAULT_DATA, sha: null };
        }

        const data = await response.json();
        if (!data.content) {
            return { content: DEFAULT_DATA, sha: data.sha };
        }

        try {
            const decodedContent = atob(data.content);
            const parsedContent = JSON.parse(decodedContent);
            return {
                content: parsedContent || DEFAULT_DATA,
                sha: data.sha
            };
        } catch (parseError) {
            console.error('データパースエラー:', parseError);
            return { content: DEFAULT_DATA, sha: data.sha };
        }
    } catch (error) {
        console.error('GitHub APIエラー:', error);
        return { content: DEFAULT_DATA, sha: null };
    }
}

async function updateFileOnGitHub(content, sha) {
    try {
        // トークンがない場合は更新をスキップ
        if (!GITHUB_CONFIG.TOKEN) {
            console.log('トークンが設定されていません。更新をスキップします。');
            return null;
        }

        const jsonString = JSON.stringify(content);
        const encodedContent = btoa(unescape(encodeURIComponent(jsonString)));

        const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Update data.json',
                content: encodedContent,
                sha: sha
            })
        });

        if (!response.ok) {
            console.error('API更新エラー:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('GitHub API更新エラー:', error);
        return null;
    }
}
