import CommonSiteHeader from './components/common/CommonSiteHeader/CommonSiteHeader';
import CommonSiteFooter from './components/common/CommonSiteFooter/CommonSiteFooter';

const App = (props: any) => (
  <>
    <CommonSiteHeader />
    {props.children}
    <CommonSiteFooter />
  </>
);

export default App;
