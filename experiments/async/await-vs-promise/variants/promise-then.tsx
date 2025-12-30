import { useState, useEffect, type FC } from "react";

/**
 * Promise.then() chains
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
const fetchUser = (id: number): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: `User ${id}` });
    }, 10);
  });
};

const fetchPosts = (userId: number): Promise<Post[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: "Post 1", userId },
        { id: 2, title: "Post 2", userId },
      ]);
    }, 10);
  });
};

const fetchUserWithPosts = (
  id: number
): Promise<{ user: User; posts: Post[] }> => {
  return fetchUser(id).then((user) => {
    return fetchPosts(user.id).then((posts) => {
      return { user, posts };
    });
  });
};

const processData = (ids: number[]): Promise<string[]> => {
  return ids.reduce((promise, id) => {
    return promise.then((results) => {
      return fetchUserWithPosts(id).then((data) => {
        results.push(`${data.user.name}: ${data.posts.length} posts`);
        return results;
      });
    });
  }, Promise.resolve<string[]>([]));
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

export function benchmark(): Promise<string> {
  return fetchUserWithPosts(1).then((data) => data.user.name);
}

export default ExperimentComponent;
