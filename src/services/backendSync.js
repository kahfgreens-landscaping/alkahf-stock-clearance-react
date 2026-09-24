/**
 * Cloud Backend Sync Service
 * Directly interacts with GitHub Contents API and jsDelivr CDN
 * to persist and distribute product changes worldwide with 0 server costs.
 */

export const GITHUB_REPO_OWNER = 'kahfgreens-landscaping';
export const GITHUB_REPO_NAME = 'alkahf-stock-clearance-react';
export const GITHUB_FILE_PATH = 'public/products-live.json';
export const GITHUB_BRANCH = 'master';
export const STORAGE_TOKEN_KEY = 'kahf_greens_github_token';

/**
 * Get saved GitHub token from localStorage
 */
export function getBackendToken() {
  try {
    return localStorage.getItem(STORAGE_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Save GitHub token to localStorage
 */
export function setBackendToken(token) {
  try {
    if (!token || !token.trim()) {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    } else {
      localStorage.setItem(STORAGE_TOKEN_KEY, token.trim());
    }
  } catch {}
}

/**
 * Remove GitHub token
 */
export function clearBackendToken() {
  try {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  } catch {}
}

/**
 * Encode a UTF-8 string to Base64 (supporting special characters: ½, ×, –, etc.)
 */
export function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binString);
}

/**
 * Fetch live data from backend across multiple resilient CDNs/endpoints
 */
export async function fetchLiveStoreData() {
  const endpoints = [
    // 1. jsDelivr global CDN with cache-bust
    `https://cdn.jsdelivr.net/gh/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}@${GITHUB_BRANCH}/${GITHUB_FILE_PATH}?t=${Date.now()}`,
    // 2. Direct GitHub API raw content (0 CDN delay, 60 req/hr per IP unauth)
    `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_FILE_PATH}`,
    // 3. GitHub Pages local deploy fallback
    `${(typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/'}products-live.json?t=${Date.now()}`
  ];

  for (let i = 0; i < endpoints.length; i++) {
    const url = endpoints[i];
    try {
      const headers = {};
      if (url.includes('api.github.com')) {
        headers['Accept'] = 'application/vnd.github.v3.raw';
        const token = getBackendToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) continue;

      const data = await res.json();
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        return {
          source: url.includes('jsdelivr') ? 'jsdelivr' : url.includes('api.github.com') ? 'github-api' : 'gh-pages',
          products: data.products,
          saleEndDate: data.saleEndDate || null,
          showSoldOutWhenZero: typeof data.showSoldOutWhenZero === 'boolean' ? data.showSoldOutWhenZero : true,
          updatedAt: data.updatedAt || null,
        };
      }
    } catch {
      // Continue to next endpoint fallback
    }
  }

  throw new Error('All live backend endpoints could not be reached');
}

/**
 * Verify if a GitHub token is valid and has push permissions on the repository
 */
export async function testTokenConnection(token) {
  const cleanToken = (token || '').trim();
  if (!cleanToken) {
    return { ok: false, error: 'Token cannot be empty' };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`, {
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (res.status === 401) {
      return { ok: false, error: 'Invalid token or token has expired. Please verify and re-enter.' };
    }
    if (res.status === 404) {
      return { ok: false, error: `Repository ${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME} not found or token has no access to it. Make sure this repository is selected under "Repository access".` };
    }
    if (!res.ok) {
      return { ok: false, error: `GitHub error HTTP ${res.status}: ${res.statusText}` };
    }

    const data = await res.json();
    const scopesHeader = res.headers.get('x-oauth-scopes');

    // If it's a classic token (has x-oauth-scopes header)
    if (scopesHeader !== null) {
      const scopes = scopesHeader.split(',').map(s => s.trim().toLowerCase());
      const hasRepoScope = scopes.includes('repo') || scopes.includes('public_repo');
      if (!hasRepoScope) {
        return {
          ok: false,
          error: 'Token is missing the "repo" scope. Classic tokens must have the "repo" or "public_repo" scope to commit changes.',
          scopes: scopesHeader
        };
      }
    }

    // Also test reading the target file via GitHub Contents API with this token
    const fileRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_FILE_PATH}`,
      {
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (fileRes.status === 403) {
      const fileErr = await fileRes.json().catch(() => ({}));
      return {
        ok: false,
        error: fileErr.message?.includes('Resource not accessible')
          ? 'Token lacks "Contents: Read and write" permission for this repository. If using a Fine-Grained token, set "Contents" to "Read and write".'
          : `HTTP 403: ${fileErr.message || 'Access forbidden'}`
      };
    }

    const canPush = Boolean(data.permissions?.push || data.permissions?.admin);

    return {
      ok: true,
      repo: data.full_name,
      canPush,
      visibility: data.private ? 'Private' : 'Public',
      defaultBranch: data.default_branch,
      isClassic: scopesHeader !== null,
    };
  } catch (err) {
    return { ok: false, error: err.message || 'Network error reaching GitHub' };
  }
}

/**
 * Commit and publish updated products directly to GitHub repository
 */
export async function publishLiveProducts({ products, saleEndDate, showSoldOutWhenZero }, customToken) {
  const token = (customToken || getBackendToken()).trim();
  if (!token) {
    throw new Error('GitHub Backend Token is required to publish changes live to all visitors.');
  }

  // 1. Get current SHA of the file
  const getRes = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}&t=${Date.now()}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  let currentSha = null;
  if (getRes.ok) {
    const fileData = await getRes.json();
    currentSha = fileData.sha;
  } else if (getRes.status === 403) {
    const errData = await getRes.json().catch(() => ({}));
    if (errData.message?.includes('Resource not accessible')) {
      throw new Error(
        'Token lacks repository permission: "Contents: Read and write". ' +
        'If using a Fine-grained token, enable Contents (Read & write). If using a Classic token, check the "repo" scope.'
      );
    }
    throw new Error(`GitHub access forbidden (HTTP 403): ${errData.message || getRes.statusText}`);
  } else if (getRes.status !== 404) {
    const errData = await getRes.json().catch(() => ({}));
    throw new Error(`Failed to retrieve file info from GitHub (HTTP ${getRes.status}): ${errData.message || getRes.statusText}`);
  }

  // 2. Prepare payload
  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    saleEndDate: saleEndDate,
    showSoldOutWhenZero: showSoldOutWhenZero,
    products: products,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const base64Content = utf8ToBase64(jsonString);

  // 3. PUT commit to GitHub
  const putRes = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Update live products & clearance settings via Admin Panel [skip ci]',
        content: base64Content,
        sha: currentSha,
        branch: GITHUB_BRANCH,
      }),
    }
  );

  if (!putRes.ok) {
    const putErr = await putRes.json().catch(() => ({}));
    if (putRes.status === 403 && putErr.message?.includes('Resource not accessible')) {
      throw new Error(
        'Permission denied (HTTP 403): Token lacks "Contents: Read and write" access. ' +
        'Please generate a Classic Token with "repo" scope or update your Fine-grained token to have "Contents: Read and write".'
      );
    }
    throw new Error(`Failed to commit changes to GitHub (HTTP ${putRes.status}): ${putErr.message || putRes.statusText}`);
  }

  const putData = await putRes.json();

  // 4. Trigger jsDelivr cache purge in background (non-blocking)
  fetch(`https://purge.jsdelivr.net/gh/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}@${GITHUB_BRANCH}/${GITHUB_FILE_PATH}`)
    .catch(() => {});

  return {
    success: true,
    commitSha: putData.commit?.sha || null,
    updatedAt: payload.updatedAt,
  };
}
