import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Header() {
  return (
    <header className={`${commonStyles.container} ${styles.logo}`}>
      <Link href="/">
        <img src="/images/logo.png" alt="logo" />
      </Link>
    </header>
  );
}
