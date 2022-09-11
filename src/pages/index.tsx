/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { RiUserLine, RiCalendarLine } from 'react-icons/ri';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';
import commomStyles from '../styles/common.module.scss';

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
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );

  async function handleFetchMorePosts() {
    if (nextPage === null) {
      return;
    }

    const response = await fetch(nextPage).then(Response => Response.json());
    setNextPage(response.next_page);

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

    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <Header />
      <main className={commomStyles.container}>
        <div className={styles.content}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>
                <div className={commomStyles.postInfo}>
                  <div>
                    <RiCalendarLine size={20} />
                    <time>{post.first_publication_date}</time>
                  </div>
                  <div>
                    <RiUserLine size={20} />
                    <p>{post.data.author}</p>
                  </div>
                </div>
              </a>
            </Link>
          ))}
          {nextPage ? (
            <button type="button" onClick={handleFetchMorePosts}>
              Carregar mais posts
            </button>
          ) : (
            <div />
          )}
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
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MM yyyy',
        {
          locale: ptBR,
        }
      ),
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
