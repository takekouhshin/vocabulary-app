// デバッグモードフラグ
const DEBUG = new URLSearchParams(window.location.search).get('debug') === 'true';

// GitHub設定
const GITHUB_CONFIG = {
    OWNER: 'takekouhshin',
    REPO: 'vocabulary-app',
    FILE_PATH: 'data.json',
    TOKEN: '' // GitHub Actionsから注入
};

async function getFileFromGitHub() {
    try {
        if (DEBUG) {
            console.log('API呼び出し設定:', {
                url: `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.FILE_PATH}`,
                hasToken: !!GITHUB_CONFIG.TOKEN
            });
        }

        const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.content) {
            return { content: { words: [], lastUpdate: new Date().toISOString() }, sha: data.sha };
        }
        return {
            content: JSON.parse(atob(data.content)),
            sha: data.sha
        };
    } catch (error) {
        console.error('GitHub APIエラー:', error);
        throw error;
    }
}

async function updateFileOnGitHub(content, sha) {
    try {
        // UTF-8文字列を適切にエンコード
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
            const errorData = await response.json();
            throw new Error(`GitHub API error: ${response.status} ${JSON.stringify(errorData)}`);
        }

        return await response.json();
    } catch (error) {
        console.error('GitHub API更新エラー:', error);
        throw error;
    }
}
