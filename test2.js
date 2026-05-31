const axios = require('axios');

async function test() {
    try {
        const response = await axios({
            method: 'GET',
            url: 'https://irctc1.p.rapidapi.com/api/v1/searchStation',
            params: { query: 'del' },
            headers: {
                'X-RapidAPI-Key': '05f40c8ac8msh4a454667be0e8a8p19f3fbjsnb43b849d3e5e',
                'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
            }
        });
        console.log("Success:", JSON.stringify(response.data).substring(0, 100));
    } catch (e) {
        console.error("Error:", e.response ? e.response.status + ' ' + e.response.data.message : e.message);
    }
}
test();
