import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const { t } = useLanguage();

  return (
    <nav>
      <Link to="/">{t.home}</Link>
      <Link to="/result">{t.result}</Link>
      <Link to="/appointment">{t.appointment}</Link>
      <Link to="/medicines">{t.medicines}</Link>
    </nav>
  );
};

export default Navbar;
