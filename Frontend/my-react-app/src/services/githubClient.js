export const githubClient = {
  // Extract username from various github url formats
  extractUsername(urlOrUsername) {
    if (!urlOrUsername) return null;
    const clean = urlOrUsername.trim();
    if (!clean.includes("/") || !clean.includes("github.com")) {
      return clean.replace(/^@/, "");
    }
    const match = clean.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
    return match ? match[1] : null;
  },

  // Fetch live public data
  async fetchUserData(urlOrUsername) {
    const username = this.extractUsername(urlOrUsername);
    if (!username) return null;

    try {
      const userRes = await fetch(`https://api.github.com/users/${username}`, {
        headers: { Accept: "application/vnd.github.v3+json" }
      });

      if (!userRes.ok) {
        console.warn(`GitHub API user fetch returned status ${userRes.status}`);
        return null;
      }

      const userData = await userRes.json();

      // Fetch repos
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=8`, {
        headers: { Accept: "application/vnd.github.v3+json" }
      });

      let repos = [];
      let topLanguages = [];
      let totalStars = 0;

      if (reposRes.ok) {
        const rawRepos = await reposRes.json();
        const langMap = {};

        repos = rawRepos.map(r => {
          totalStars += r.stargazers_count || 0;
          if (r.language) {
            langMap[r.language] = (langMap[r.language] || 0) + 1;
          }
          return {
            name: r.name,
            description: r.description || "Public open-source repository",
            stars: r.stargazers_count,
            forks: r.forks_count,
            language: r.language,
            url: r.html_url,
            updatedAt: r.pushed_at
          };
        });

        topLanguages = Object.entries(langMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([lang, count]) => ({ name: lang, count }));
      }

      return {
        username: userData.login,
        name: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
        bio: userData.bio || "Active GitHub Contributor",
        publicRepos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        profileUrl: userData.html_url,
        topLanguages,
        totalStars,
        featuredRepos: repos.slice(0, 4),
        verified: true
      };
    } catch (err) {
      console.error("Error fetching GitHub profile:", err);
      return null;
    }
  }
};
