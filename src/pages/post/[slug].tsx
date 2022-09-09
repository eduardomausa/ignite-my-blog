/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticPaths, GetStaticProps } from 'next';
import { RiCalendarLine, RiUserLine, RiTimeLine } from 'react-icons/ri';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';

import styles from './post.module.scss';
import { getPrismicClient } from '../../services/prismic';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();

  if (isFallback || !post) {
    return (
      <main className={styles.container}>
        <section className={`${styles.content} ${styles.loading}`}>
          <h1>Carregando...</h1>
        </section>
      </main>
    )
  }

  return (
    <>
      {post.data.content.map(content => {
        return (
          <article key={content.heading}>
            <h2>{content.heading}</h2>
            <div
              className={styles.postContent}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </article>
        );
      })}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug));

  return {
    props: {
      post: response,
    },
    revalidate: 1800,
  };
};