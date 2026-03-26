#!/usr/bin/env node
// Twitter/X API v2 OAuth 1.0a helper — built-ins only (node:crypto, node:https)
// Source: https://developer.x.com/en/docs/authentication/oauth-1-0a/creating-a-signature

import { createHmac, randomBytes } from 'node:crypto';
import { request } from 'node:https';

const {
  X_CONSUMER_KEY: consumerKey,
  X_CONSUMER_SECRET: consumerSecret,
  X_ACCESS_TOKEN: accessToken,
  X_ACCESS_TOKEN_SECRET: accessTokenSecret,
  ACTION,
  TWEET_TEXT: tweetText,
  TWEET_ID: tweetId,
  USER_ID: userId
} = process.env;

// Validate credentials
if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
  console.error('ERROR: Missing X OAuth credentials.');
  console.error('Required: X_CONSUMER_KEY, X_CONSUMER_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET');
  console.error('Run /pocket-knife:setup to configure your API keys.');
  process.exit(1);
}

if (!ACTION) {
  console.error('ERROR: ACTION environment variable not set.');
  console.error('Valid actions: post, like, retweet, delete, me');
  process.exit(1);
}

function percentEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function buildOAuthHeader(method, url, bodyParams = {}) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomBytes(16).toString('hex');

  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: '1.0'
  };

  const allParams = { ...oauthParams, ...bodyParams };
  const sortedParams = Object.keys(allParams).sort()
    .map(k => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join('&');

  const baseString = [method.toUpperCase(), percentEncode(url), percentEncode(sortedParams)].join('&');
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(accessTokenSecret)}`;
  const signature = createHmac('sha1', signingKey).update(baseString).digest('base64');

  const headerParams = { ...oauthParams, oauth_signature: signature };
  const headerStr = Object.keys(headerParams).sort()
    .map(k => `${k}="${percentEncode(headerParams[k])}"`)
    .join(', ');

  return `OAuth ${headerStr}`;
}

function httpsRequest(method, hostname, path, headers, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function main() {
  const BASE_URL = 'api.twitter.com';

  switch (ACTION) {
    case 'post': {
      if (!tweetText) {
        console.error('ERROR: TWEET_TEXT environment variable not set for post action.');
        process.exit(1);
      }
      const url = `https://${BASE_URL}/2/tweets`;
      const authHeader = buildOAuthHeader('POST', url, {});
      const result = await httpsRequest('POST', BASE_URL, '/2/tweets', {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }, { text: tweetText });
      console.log(JSON.stringify(result));
      break;
    }

    case 'like': {
      if (!tweetId || !userId) {
        console.error('ERROR: TWEET_ID and USER_ID environment variables required for like action.');
        process.exit(1);
      }
      const url = `https://${BASE_URL}/2/users/${userId}/likes`;
      const authHeader = buildOAuthHeader('POST', url, {});
      const result = await httpsRequest('POST', BASE_URL, `/2/users/${userId}/likes`, {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }, { tweet_id: tweetId });
      console.log(JSON.stringify(result));
      break;
    }

    case 'retweet': {
      if (!tweetId || !userId) {
        console.error('ERROR: TWEET_ID and USER_ID environment variables required for retweet action.');
        process.exit(1);
      }
      const url = `https://${BASE_URL}/2/users/${userId}/retweets`;
      const authHeader = buildOAuthHeader('POST', url, {});
      const result = await httpsRequest('POST', BASE_URL, `/2/users/${userId}/retweets`, {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }, { tweet_id: tweetId });
      console.log(JSON.stringify(result));
      break;
    }

    case 'delete': {
      if (!tweetId) {
        console.error('ERROR: TWEET_ID environment variable required for delete action.');
        process.exit(1);
      }
      const url = `https://${BASE_URL}/2/tweets/${tweetId}`;
      const authHeader = buildOAuthHeader('DELETE', url, {});
      const result = await httpsRequest('DELETE', BASE_URL, `/2/tweets/${tweetId}`, {
        'Authorization': authHeader
      });
      console.log(JSON.stringify(result));
      break;
    }

    case 'me': {
      const url = `https://${BASE_URL}/2/users/me`;
      const authHeader = buildOAuthHeader('GET', url, {});
      const result = await httpsRequest('GET', BASE_URL, '/2/users/me', {
        'Authorization': authHeader
      });
      console.log(JSON.stringify(result));
      break;
    }

    default:
      console.error(`ERROR: Unknown action "${ACTION}". Valid actions: post, like, retweet, delete, me`);
      process.exit(1);
  }
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
