import { useState, useEffect, type FC } from "react";

/**
 * async/await syntax
 */

interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  userId: number;
}

// Simulated API calls
const fetchUser = async (id: number): Promise<User> => {
  await new Promise((r) => setTimeout(r, 10));
  return { id, name: `User ${id}` };
};

const fetchPosts = async (userId: number): Promise<Post[]> => {
  await new Promise((r) => setTimeout(r, 10));
  return [
    { id: 1, title: "Post 1", userId },
    { id: 2, title: "Post 2", userId },
  ];
};

const fetchUserWithPosts = async (
  id: number
): Promise<{ user: User; posts: Post[] }> => {
  const user = await fetchUser(id);
  const posts = await fetchPosts(user.id);
  return { user, posts };
};

const processData = async (ids: number[]): Promise<string[]> => {
  const results: string[] = [];
  for (const id of ids) {
    const data = await fetchUserWithPosts(id);
    results.push(`${data.user.name}: ${data.posts.length} posts`);
  }
  return results;
};

interface Props {
  userIds: number[];
}

export const ExperimentComponent: FC<Props> = ({ userIds }) => {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const results = await processData(userIds);
      setData(results);
      setLoading(false);
    };
    load();
  }, [userIds]);

  if (loading) return <div>Loading...</div>;
  return (
    <ul>
      {data.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
};

export async function benchmark(): Promise<string> {
  const data = await fetchUserWithPosts(1);
  return data.user.name;
}

export default ExperimentComponent;
