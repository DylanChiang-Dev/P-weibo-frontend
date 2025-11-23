import fetch from 'node-fetch';
import FormData from 'form-data';

const API_URL = 'http://localhost:8080/api';
const EMAIL = '3331322@gmail.com';
const PASSWORD = 'ca123456789';

async function run() {
    console.log('🔐 Logging in...');
    const loginRes = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    const loginData = await loginRes.json();
    if (!loginData.data || !loginData.data.access_token) {
        console.error('❌ Login failed:', loginData);
        return;
    }
    const token = loginData.data.access_token;
    console.log('✅ Logged in');

    // 1. Create Post (Public)
    console.log('\n📝 Creating public post...');

    // Actually, let's use FormData for creation as that's what the frontend does
    const form = new FormData();
    form.append('content', 'Visibility Test Post');
    form.append('visibility', 'public');

    const createRes2 = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            ...form.getHeaders()
        },
        body: form
    });
    const createData = await createRes2.json();

    if (!createData.data || !createData.data.id) {
        console.error('❌ Create failed:', createData);
        return;
    }
    const postId = createData.data.id;
    console.log(`✅ Post created (ID: ${postId})`);

    // 2. Check Initial Visibility
    console.log('\n🔍 Checking initial visibility...');
    const getRes1 = await fetch(`${API_URL}/posts/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const getJson1 = await getRes1.json();
    console.log('GET Response:', JSON.stringify(getJson1, null, 2));
    const post1 = getJson1.data;
    console.log(`Current visibility: ${post1.visibility}`);
    if (post1.visibility !== 'public') console.error('❌ Expected public');

    // 3. Update to Private (JSON first)
    console.log('\n🔒 Updating to private (JSON)...');
    const updateRes1JSON = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ visibility: 'private' })
    });
    const updateData1JSON = await updateRes1JSON.json();
    console.log('Update response (JSON):', updateData1JSON);
    console.log('Response visibility:', updateData1JSON.data?.visibility);

    // 4. Check Visibility after JSON update
    const getRes2JSON = await fetch(`${API_URL}/posts/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const getJson2JSON = await getRes2JSON.json();
    const post2JSON = getJson2JSON.data;
    console.log(`Current visibility after JSON update: ${post2JSON.visibility}`);
    if (post2JSON.visibility !== 'private') console.error('❌ Expected private after JSON update');

    // 5. Update to Private (FormData)
    console.log('\n🔒 Updating to private (FormData)...');
    const formPrivate = new FormData();
    formPrivate.append('visibility', 'private');
    const updateRes1 = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            ...formPrivate.getHeaders()
        },
        body: formPrivate
    });
    const updateData1 = await updateRes1.json();
    console.log('Update response (FormData):', updateData1);
    console.log('Response visibility:', updateData1.data?.visibility);

    // 6. Check Visibility after FormData update
    const getRes2 = await fetch(`${API_URL}/posts/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const getJson2 = await getRes2.json();
    const post2 = getJson2.data;
    console.log(`Current visibility after FormData update: ${post2.visibility}`);
    if (post2.visibility !== 'private') console.error('❌ Expected private');

    // 5. Update to Public (FormData) - to test that path too
    console.log('\n🌐 Updating to public (FormData)...');
    const form2 = new FormData();
    form2.append('visibility', 'public');
    const updateRes2 = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            ...form2.getHeaders()
        },
        body: form2
    });
    const updateData2 = await updateRes2.json();
    console.log('Update response:', updateData2);

    // 6. Check Visibility
    const getRes3 = await fetch(`${API_URL}/posts/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const getJson3 = await getRes3.json();
    const post3 = getJson3.data;
    console.log(`Current visibility: ${post3.visibility}`);
    if (post3.visibility !== 'public') console.error('❌ Expected public');

    // 7. Cleanup
    console.log('\n🗑️ Cleaning up...');
    await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Post deleted');
}

run().catch(console.error);
