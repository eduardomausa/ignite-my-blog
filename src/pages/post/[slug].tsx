import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { RiCalendarLine, RiTimeLine, RiUserLine } from 'react-icons/ri';
import Header from '../../components/Header';
import commomStyles from '../../styles/common.module.scss';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();

  if (isFallback || !post) {
    return (
      <main className={commonStyles.container}>
        <h1>Carregando ...</h1>
      </main>
    );
  }

  const totalWords = post.data.content.reduce((total, contentItem) => {
    const headingWords = contentItem.heading.split(/\s+/).length;
    const bodyWords = RichText.asText(contentItem.body).split(/\s+/).length;

    return total + headingWords + bodyWords;
  }, 0);

  const readingTime = Math.ceil(totalWords / 200);

  return (
    <>
      <Header />
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="Banner" />
      </div>
      <main className={commonStyles.container}>
        <section className={styles.content}>
          <div className={styles.postHeader}>
            <h1>{post.data.title}</h1>

            <div className={commomStyles.postInfo}>
              <div>
                <RiCalendarLine size={20} />
                <time>
                  {format(new Date(post.first_publication_date), 'dd MM yyyy', {
                    locale: ptBR,
                  })}
                </time>
              </div>
              <div>
                <RiUserLine size={20} />
                <p>{post.data.author}</p>
              </div>
              <div>
                <RiTimeLine size={20} />
                <p>{`${readingTime} min`}</p>
              </div>
            </div>
          </div>

          {post.data.content.map(postContent => {
            return (
              <article key={postContent.heading} className={styles.postContent}>
                <h3>{postContent.heading}</h3>
                <div
                  className={styles.postBody}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(postContent.body),
                  }}
                />
              </article>
            );
          })}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post');

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
  const response = await prismic.getByUID('post', String(slug), {});

  return {
    props: {
      post: response,
    },
    revalidate: 60 * 60 * 24, // 1 day
  };
};
