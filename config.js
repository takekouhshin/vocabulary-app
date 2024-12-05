// Google Sheets API設定
const SHEETS_CONFIG = {
    API_KEY: 'AIzaSyAIxUb3ZheM0C36NIMkt3A-lBBb1LbSecM', // Google Cloud ConsoleからコピーしたAPIキー
    SPREADSHEET_ID: '10WLf6zUa_58n6-BRpL63HHl1zkjI1uOHFfwH5CFDr-0', // スプレッドシートのURL中のID
    RANGE: 'Sheet1!A:D'
};

// スプレッドシートからデータを取得
async function getWordsFromSheets() {
    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${SHEETS_CONFIG.RANGE}?key=${SHEETS_CONFIG.API_KEY}`
        );

        if (!response.ok) {
            console.error('API応答エラー:', response.status);
            return { words: [] };
        }

        const data = await response.json();
        const rows = data.values || [];
        
        // 最初の行はヘッダーとしてスキップ
        const words = rows.slice(1).map(row => ({
            word: row[0] || '',
            meaning: row[1] || '',
            example: row[2] || '',
            addedAt: row[3] || new Date().toISOString()
        }));

        return { words };
    } catch (error) {
        console.error('Sheets APIエラー:', error);
        return { words: [] };
    }
}

// スプレッドシートにデータを更新
async function updateWordsInSheets(words) {
    try {
        // データを2次元配列に変換
        const values = [
            ['Word', 'Meaning', 'Example', 'Added At'], // ヘッダー行
            ...words.map(w => [w.word, w.meaning, w.example, w.addedAt])
        ];

        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${SHEETS_CONFIG.RANGE}?valueInputOption=RAW&key=${SHEETS_CONFIG.API_KEY}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: values
                })
            }
        );

        if (!response.ok) {
            console.error('API更新エラー:', response.status);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Sheets API更新エラー:', error);
        return false;
    }
}
