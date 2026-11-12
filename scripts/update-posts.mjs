// 블로그(kyungjin.dev)의 발행 글 목록(posts.json)을 읽어 README의 POSTS 블록을 카테고리별 최근 3개로 다시 쓴다.
// 의존성 없음 (Node 20+ 내장 fetch). GitHub Action이 매일 실행한다.
import { readFile, writeFile } from 'node:fs/promises';

const SITE = 'https://kyungjin.dev';
const PER_SECTION = 3;
const SECTIONS = [
	{ id: 'work', label: '🛠 Work', desc: '일하며 겪은 문제' },
	{ id: 'side', label: '🧪 Side', desc: '개인 프로젝트에서 배운 것' },
	{ id: 'study', label: '📚 Study', desc: '따로 공부한 기록' },
];

const res = await fetch(`${SITE}/posts.json`);
if (!res.ok) throw new Error(`posts.json ${res.status}`);
const posts = (await res.json()).sort((a, b) => b.pubDate.localeCompare(a.pubDate));

const blocks = SECTIONS.map(({ id, label, desc }) => {
	const items = posts.filter((p) => p.category === id).slice(0, PER_SECTION);
	if (items.length === 0) return null; // 글이 없는 카테고리는 숨긴다
	const lines = items.map((p) => `- [${p.title}](${SITE}/posts/${p.slug}/) <sub>${p.pubDate.slice(0, 10)}</sub>`);
	return `### ${label} <sub>${desc} · [더보기](${SITE}/posts/category/${id}/)</sub>\n\n${lines.join('\n')}`;
}).filter(Boolean);

const readme = await readFile('README.md', 'utf8');
const next = readme.replace(
	/<!-- POSTS:START -->[\s\S]*<!-- POSTS:END -->/,
	`<!-- POSTS:START -->\n${blocks.join('\n\n')}\n<!-- POSTS:END -->`,
);
await writeFile('README.md', next);
console.log(next === readme ? 'no change' : 'README updated');
