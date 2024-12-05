// Google Sheets API設定
const SHEETS_CONFIG = {
    API_KEY: 'AIzaSyAIxUb3ZheM0C36NIMkt3A-lBBb1LbSecM',
    SPREADSHEET_ID: '10WLf6zUa_58n6-BRpL63HHl1zkjI1uOHFfwH5CFDr-0',
    RANGE: 'Sheet1!A:D'
};

// スプレッドシートからデータを取得
async function getWordsFromSheets() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${SHEETS_CONFIG.RANGE}`;
        const params = new URLSearchParams({
            key: SHEETS_CONFIG.API_KEY,
            valueRenderOption: 'FORMATTED_VALUE',
            dateTimeRenderOption: 'FORMATTED_STRING'
        });

        const response = await fetch(`${url}?${params.toString()}`);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API応答詳細:', errorData);
            throw new Error(`Sheets API error: ${response.status}`);
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

        return { 
            words,
            lastUpdate: new Date().toISOString()
        };
    } catch (error) {
        console.error('Sheets APIエラー:', error);
        return { 
            words: [],
            lastUpdate: new Date().toISOString()
        };
    }
}

// スプレッドシートにデータを更新
async function updateWordsInSheets(words) {
    try {
        const values = [
            ['Word', 'Meaning', 'Example', 'Added At'], // ヘッダー行
            ...words.map(w => [w.word, w.meaning, w.example, w.addedAt])
        ];

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${SHEETS_CONFIG.RANGE}`;
        const params = new URLSearchParams({
            key: SHEETS_CONFIG.API_KEY,
            valueInputOption: 'RAW'
        });

        const response = await fetch(`${url}?${params.toString()}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: values
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API更新エラー詳細:', errorData);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Sheets API更新エラー:', error);
        return false;
    }
}
