import SiteHeader from './components/SiteHeader/SiteHeader';
import SiteFooter from './components/SiteFooter/SiteFooter';

const App = (props: any) => (
  <>
    <SiteHeader />
    {props.children}
    <SiteFooter />
  </>
);

export default App;
