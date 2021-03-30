import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'
import Prismic from '@prismicio/client'
import { format } from 'date-fns'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import Header from '../../components/Header'
import { useRouter } from 'next/router';
import { Comments } from '../../components/Comments';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  nextPost?: { uid: string; title: string };
  prevPost?: { uid: string; title: string };
}

export default function Post({ post, nextPost, prevPost }: PostProps) {
  const router = useRouter()

  if(router.isFallback) {
    return <h1>Carregando...</h1>
  }

  function handleGoToPrevPost() {
    router.push(`/post/${prevPost.uid}`)
  }

  function handleGoToNextPost() {
    router.push(`/post/${nextPost.uid}`)
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <article className={styles.post}>
          <img src={post?.data.banner.url} alt={post?.data.title} />
          <section>
            <header>
              <h1>{post?.data.title}</h1>
              <div>
                <FiCalendar />
                <time>
                  {format(
                    new Date(post?.first_publication_date),
                    "dd MMM yyyy"
                  ).toLowerCase()}
                </time>
                <FiUser />
                <span>{post?.data.author}</span>
                <FiClock />
                <time>4 min</time>
              </div>

              <aside>
                <time>{format(
                  new Date(post?.last_publication_date),
                  "'editado em' dd MMM yyyy, 'às' hh:mm"
                  )}
                </time>
              </aside>
            </header>

            <div className={styles.topicsList}>
              {post?.data.content.map(topic => (
                <div className={styles.topic} key={topic.heading}>
                  <header>
                    {topic.heading}
                  </header>
                  {topic.body.map((paragraph, index) => (
                    <div
                    key={index}
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
        <footer className={styles.otherPosts}>
          {prevPost && (
            <button type="button" onClick={handleGoToPrevPost}>
              <p>{prevPost.title}</p>
              <p>Post anterior</p>
            </button>
          )}

          {nextPost && (
            <button type="button" onClick={handleGoToNextPost}>
              <p>{nextPost.title}</p>
              <p>Próximo Post</p>
            </button>
          )}
        </footer>

        <Comments />
      </main>
    </>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    { fetch: ['post.title', 'post.subtitle', 'post.author'],  pageSize: 1 }
  );

  const params = postsResponse.results.map(post => {
    return { params: { slug: post.uid } }
  })

  return {
    paths: params,
    fallback: true
  }
};

export const getStaticProps = async ({ req, params }) => {
  const { slug } = params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});



  try {
    const prevPost = await prismic.query(
      [Prismic.predicates.at('document.type', 'post')],
      {
        fetch: 'post.title',
        pageSize: 1,
        after : `${response.uid}`,
        orderings: '[document.first_publication_date desc]'
      },
    )

    const nextPost = await prismic.query(
      [Prismic.predicates.at('document.type', 'post')],
      {
        fetch: 'post.title',
        pageSize: 1,
        after : `${response.uid}`,
        orderings: '[document.first_publication_date]'
      },
    )

    const post = {
      uid: response.uid,
      first_publication_date: response.first_publication_date,
      last_publication_date: response.last_publication_date,
      data: {
        title: response.data.title,
        subtitle: response.data.subtitle,
        banner: {
          url: response.data.banner.url,
        },
        author: response.data.author,
        content: response.data.content,
      }
    }

    const pp = prevPost.results[0]? {
      uid: prevPost.results[0].uid,
      title: prevPost.results[0].data.title,
    } : null

    const np = nextPost.results[0]? {
      uid: nextPost.results[0].uid,
      title: nextPost.results[0].data.title,
    } : null

    return {
      props: { post, prevPost: pp, nextPost: np },
      revalidate: 60 * 60
    }
  } catch {
    return {
      props: { }
    }
  }
};
