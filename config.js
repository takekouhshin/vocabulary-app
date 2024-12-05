// GitHubの設定
const GITHUB_CONFIG = {
    TOKEN: 'YOUR_GITHUB_TOKEN',  // ここに自分のGitHubトークンを設定
    OWNER: 'YOUR_USERNAME',      // GitHubのユーザー名
    REPO: 'vocabulary-app',      // リポジトリ名
    FILE_PATH: 'data.json'       // データファイルのパス
};

// GitHubからファイルを取得する関数
async function getFileFromGitHub() {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const data = await response.json();
        const content = atob(data.sha ? data.content : '');
        return {
            content: JSON.parse(content),
            sha: data.sha
        };
    } catch (error) {
        console.error('GitHub APIエラー:', error);
        return { content: { words: [], lastUpdate: new Date().toISOString() }, sha: null };
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