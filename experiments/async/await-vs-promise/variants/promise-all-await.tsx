import { useState, useEffect, type FC } from "react";

/**
 * Promise.all with await for parallel execution
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
  // Parallel fetch
  const [user, posts] = await Promise.all([fetchUser(id), fetchPosts(id)]);
  return { user, posts };
};

const processData = async (ids: number[]): Promise<string[]> => {
  // Parallel processing of all users
  const results = await Promise.all(
    ids.map((id) =>
      fetchUserWithPosts(id).then(
        (data) => `${data.user.name}: ${data.posts.length} posts`
      )
    )
  );
  return results;
};

interface Props {
  userIds: number[];
}

export const ExperimentComponent: FC<Props> = ({ userIds }) => {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    processData(userIds).then((results) => {
      setData(results);
      setLoading(false);
    });
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
