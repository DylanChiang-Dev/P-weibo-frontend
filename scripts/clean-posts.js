#!/usr/bin/env node

/**
 * Clean all posts from P-Weibo
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:8080/api';
const EMAIL = '3331322@gmail.com';
const PASSWORD = 'ca123456789';

async function login() {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    const data = await res.json();
    return data.data?.access_token;
}

async function getPosts(token) {
    const posts = [];
    let cursor = null;

    while (true) {
        const url = cursor ? `${API_URL}/posts?cursor=${cursor}&limit=100` : `${API_URL}/posts?limit=100`;
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (!data.data?.items || data.data.items.length === 0) break;

        posts.push(...data.data.items);
        cursor = data.data.next_cursor;

        if (!cursor) break;
    }

    return posts;
}

async function deletePost(token, postId) {
    const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok;
}

async function main() {
    console.log('🔐 登錄中...');
    const token = await login();

    if (!token) {
        console.error('❌ 登錄失敗');
        process.exit(1);
    }

    console.log('✅ 登錄成功\n');

    console.log('📥 獲取所有貼文...');
    const posts = await getPosts(token);
    console.log(`找到 ${posts.length} 篇貼文\n`);

    if (posts.length === 0) {
        console.log('沒有貼文需要刪除');
        return;
    }

    console.log('🗑️  開始刪除...\n');

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const title = post.content.substring(0, 30) + '...';
        console.log(`[${i + 1}/${posts.length}] 刪除: ${title}`);

        const success = await deletePost(token, post.id);
        if (success) {
            console.log('   ✅ 成功');
        } else {
            console.log('   ❌ 失敗');
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n✨ 清理完成！');
}

main().catch(console.error);
