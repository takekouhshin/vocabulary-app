// Google Sheets API設定
const SHEETS_CONFIG = {
    API_KEY: 'AIzaSyAIxUb3ZheM0C36NIMkt3A-lBBb1LbSecM',
    SPREADSHEET_ID: '10WLf6zUa_58n6-BRpL63HHl1zkjI1uOHFfwH5CFDr-0',
    SHEET_NAME: 'Sheet1',
    RANGE: 'A1:D1000'
};

// スプレッドシートからデータを取得
async function getWordsFromSheets() {
    try {
        const baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
        // 範囲を正しい形式でエンコード
        const range = encodeURIComponent(`${SHEETS_CONFIG.SHEET_NAME}!${SHEETS_CONFIG.RANGE}`);
        const url = new URL(`${baseUrl}/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${range}`);
        
        // クエリパラメータを追加
        url.searchParams.append('key', SHEETS_CONFIG.API_KEY);

        console.log('リクエストURL:', url.toString()); // デバッグ用

        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API応答詳細:', errorData);
            throw new Error(`Sheets API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('API応答データ:', data); // デバッグ用
        
        if (!data.values) {
            return { 
                words: [],
                lastUpdate: new Date().toISOString()
            };
        }

        const words = data.values.slice(1).map(row => ({
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
            ['Word', 'Meaning', 'Example', 'Added At']
        ];

        words.forEach(word => {
            values.push([
                word.word,
                word.meaning,
                word.example,
                word.addedAt
            ]);
        });

        const baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
        const url = `${baseUrl}/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${SHEETS_CONFIG.RANGE}`;

        const response = await fetch(`${url}?key=${SHEETS_CONFIG.API_KEY}&valueInputOption=RAW`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                range: SHEETS_CONFIG.RANGE,
                majorDimension: 'ROWS',
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
