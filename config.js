// Google Sheets API設定
const SHEETS_CONFIG = {
    API_KEY: 'AIzaSyAIxUb3ZheM0C36NIMkt3A-lBBb1LbSecM', // Google Cloud ConsoleからコピーしたAPIキー
    SPREADSHEET_ID: '10WLf6zUa_58n6-BRpL63HHl1zkjI1uOHFfwH5CFDr-0', // スプレッドシートのURL中のID
    RANGE: 'Sheet1!A:D'
};

async function getWordsFromSheets() {
    try {
        if (!SHEETS_CONFIG.API_KEY || !SHEETS_CONFIG.SPREADSHEET_ID) {
            console.error('API_KEYまたはSPREADSHEET_IDが設定されていません');
            return { words: [], lastUpdate: new Date().toISOString() };
        }

        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${SHEETS_CONFIG.RANGE}?key=${SHEETS_CONFIG.API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`Sheets API error: ${response.status}`);
        }

        const data = await response.json();
        const rows = data.values || [];
        
        // ヘッダー行をスキップしてデータを整形
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
        return { words: [], lastUpdate: new Date().toISOString() };
    }
}

async function updateWordsInSheets(words) {
    try {
        const values = [
            ['Word', 'Meaning', 'Example', 'Added At'], // ヘッダー行
            ...words.map(w => [w.word, w.meaning, w.example || '', w.addedAt])
        ];

        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${SHEETS_CONFIG.RANGE}?key=${SHEETS_CONFIG.API_KEY}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values,
                    valueInputOption: 'RAW'
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Sheets API error: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Sheets API更新エラー:', error);
        return false;
    }
}
