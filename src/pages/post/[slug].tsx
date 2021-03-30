import { useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

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

export default function Post({ post }: PostProps) {
  const router = useRouter()

  useEffect(() => {
    if(!post) {
      router.push('/')
    }
  }, [])

  return (
    <main className={styles.container}>
      <article className={styles.post}>
        <img src={post?.data.banner.url} alt={post?.data.title} />
        <section>
          <header>
            <h1>{post?.data.title}</h1>
            <div>
              <FiCalendar />
              <time>
                {post?.first_publication_date}
              </time>
              <FiUser />
              <span>{post?.data.author}</span>
              <FiClock />
              <time>5 min</time>
            </div>
          </header>

          <div className={styles.topicsList}>
            {post?.data.content.map(topic => (
              <div className={styles.topic} key={topic.heading}>
                <header>
                  {topic.heading}
                </header>
                {topic.body.map(paragraph => (
                  <div
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{ __html: paragraph.text }}
                  />
                ))
                }
              </div>
            ))}
          </div>

        </section>
      </article>
    </main>
  )
}

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   // TODO
// };

export const getStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: 'blocking' })

export const getStaticProps = async ({ req, params }) => {
  const { slug } = params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  try {
    const post = {
      first_publication_date: new Date(response.first_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      data: {
        title: response.data.title,
        banner: {
          url: response.data.banner.url,
        },
        author: response.data.author,
        content: response.data.content,
      }
    }

    return {
      props: { post },
      revalidate: 60 * 60
    }
  } catch {
    return {
      props: { }
    }
  }
};
