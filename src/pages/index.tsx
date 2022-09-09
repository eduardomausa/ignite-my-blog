/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { RiUserLine, RiCalendarLine } from 'react-icons/ri';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const blogTitleStart = '<';
  const blogTitleMiddle = ' ';
  const blogTitleEnd = '/>.';
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );

  async function handleFetchMorePosts() {
    if (nextPage) {
      const response = await (await fetch(nextPage)).json();

      const newPosts = response.results.map((post: Post) => ({
        uid: post.uid,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },

        first_publication_date: new Date(
          post.first_publication_date
        ).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
      }));

      setNextPage(response.next_page);
      setPosts(oldState => [...oldState, ...newPosts]);
    }
  }

  return (
    <>
      <Head>
        <title>Home | Mausa Dev</title>
      </Head>
      <main className={styles.contentContainer}>
        <div className={styles.content}>
          <h1>
            {blogTitleStart}
            <span>{blogTitleMiddle}</span>
            {blogTitleEnd}
          </h1>
          {posts.map(post => (
            <Link key={post.uid} href={`/posts/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p className={styles.subtitle}>{post.data.subtitle}</p>
                <div className={styles.postInfo}>
                  <RiCalendarLine size={20} />
                  <time>{post.first_publication_date}</time>
                  <RiUserLine size={20} />
                  <p>{post.data.author}</p>
                </div>
              </a>
            </Link>
          ))}
          <button type="button" onClick={handleFetchMorePosts}>
            Carregar mais posts
          </button>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', { pageSize: 1 });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    };
  });

  const postsPagination = {
    results: posts,
    next_page: postsResponse.next_page,
  };

  return {
    props: { postsPagination },
    revalidate: 60 * 60 * 24, // 1 day
  };
};
