import Head from 'next/head'
import Link from 'next/link'

import { FiCalendar, FiUser } from 'react-icons/fi'

import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss'

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

export default function Home() {
  const temp = [{ id: 0 }, { id: 1 }, { id: 2 }]

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.list}>
          {temp.map(t => (
            <Link href={`/post/${t.id}`} key={t.id}>
              <a>
                <strong>Como utilizar react hooks</strong>
                <p>alo alo alo alo alo alo alo alo alo alo alo alo alo alo alo alo alo alo</p>
                <footer>
                  <FiCalendar />
                  <time>29 Mar 2021</time>
                  <FiUser />
                  <span>Joao Ladeira</span>
                </footer>
              </a>
            </Link>
          ))}
        </div>
        <footer className={styles.footer}>
          <button type="button">Carregar mais posts</button>
        </footer>
      </main>
    </>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
