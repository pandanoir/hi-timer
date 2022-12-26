import styles from '../../styles/Home.module.css';

const TopPage = () => (
  <div className={styles.container}>
    <main className={styles.main}>
      <h1 className={styles.title}>Hi Timer</h1>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/api/auth/login">login</a>
    </main>
  </div>
);
export default TopPage;
