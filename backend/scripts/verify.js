const http = require('http');

const makeRequest = (options, data) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: body });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
};

async function runTests() {
    console.log('--- Starting Verification ---');

    const baseUrl = {
        hostname: 'localhost',
        port: 3000,
        headers: { 'Content-Type': 'application/json' }
    };

    // 1. Create Book (Admin)
    console.log('\n1. Testing Create Book (Admin)...');
    const bookData = { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', stock: 5 };
    const createRes = await makeRequest({
        ...baseUrl,
        path: '/api/books',
        method: 'POST',
        headers: { ...baseUrl.headers, 'x-user-role': 'admin' }
    }, bookData);
    console.log('Status:', createRes.status);
    console.log('Response:', createRes.body);
    const bookId = createRes.body.id;

    // 2. Get All Books (Public)
    console.log('\n2. Testing Get All Books (Public)...');
    const listRes = await makeRequest({
        ...baseUrl,
        path: '/api/books',
        method: 'GET'
    });
    console.log('Status:', listRes.status);
    console.log('Books found:', listRes.body.length);

    // 3. Borrow Book (User)
    if (bookId) {
        console.log('\n3. Testing Borrow Book (User)...');
        const borrowData = { bookId: bookId, latitude: -6.2, longitude: 106.8 };
        const borrowRes = await makeRequest({
            ...baseUrl,
            path: '/api/borrow',
            method: 'POST',
            headers: {
                ...baseUrl.headers,
                'x-user-role': 'user',
                'x-user-id': '123'
            }
        }, borrowData);
        console.log('Status:', borrowRes.status);
        console.log('Response:', borrowRes.body);
    } else {
        console.log('\nSkipping Borrow Test (No book created)');
    }

    // 4. Verify Stock Reduction
    if (bookId) {
        console.log('\n4. Verifying Stock Reduction...');
        const bookRes = await makeRequest({
            ...baseUrl,
            path: `/api/books/${bookId}`,
            method: 'GET'
        });
        console.log('Original Stock:', 5);
        console.log('Current Stock:', bookRes.body.stock);
    }
}

// Wait for server to start roughly
setTimeout(runTests, 2000);
