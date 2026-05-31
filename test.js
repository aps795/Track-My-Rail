const axios = require('axios');

async function test() {
    try {
        const response = await axios({
            method: 'GET',
            url: 'https://irctc1.p.rapidapi.com/api/v1/searchTrain',
            params: { query: '129' },
            headers: {
                'X-RapidAPI-Key': '05f40c8ac8msh4a454667be0e8a8p19f3fbjsnb43b849d3e5e',
                'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
            }
        });
        console.log(JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
test();
