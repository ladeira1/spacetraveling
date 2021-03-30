import { useState } from 'react';
import Head from 'next/head'
import Link from 'next/link'
import Prismic from '@prismicio/client'
import { FiCalendar, FiUser } from 'react-icons/fi'

import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss'

import Header from '../components/Header'

import { format } from 'date-fns'

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page?: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results)
  const [nextPage, setNextPage] = useState<string | null>(postsPagination.next_page)

  if(preview) {
    console.log(postsPagination)
  }

  async function handleSearchForMorePosts() {
    fetch(nextPage)
      .then(response => response.json())
      .then(posts => {
        const newPosts = posts.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: post.data
          }
        })
        setPosts(oldState => [...oldState, ...newPosts])
        setNextPage(posts.next_page)
      })
  }

  return (
    <>
      <Header />
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.list}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <footer>
                  <FiCalendar />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      "dd MMM yyyy"
                    ).toLowerCase()}
                  </time>
                  <FiUser />
                  <span>{post.data.author}</span>
                </footer>
              </a>
            </Link>
          ))}
        </div>
        {nextPage && (
          <footer className={styles.footer}>
            <button type="button" onClick={handleSearchForMorePosts}>Carregar mais posts</button>
          </footer>
        )}
      </main>

      {preview && (
        <aside>
          <Link href="/api/exit-preview">
            <a>Sair do modo Preview</a>
          </Link>
        </aside>
      )}
    </>
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({ preview = false, previewData }) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 2,
      ref: previewData?.ref ?? null,
    },
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: post.data
    }
  })

  const postsPagination = {
    results: posts,
    next_page: postsResponse.next_page
  }

  return {
    props: { postsPagination, preview },
    revalidate: 30
  }
};
