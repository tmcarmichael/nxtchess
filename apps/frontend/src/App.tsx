import { type ParentComponent } from 'solid-js';
import CommonSiteFooter from './components/common/CommonSiteFooter/CommonSiteFooter';
import CommonSiteHeader from './components/common/CommonSiteHeader/CommonSiteHeader';

const App: ParentComponent = (props) => (
  <>
    <CommonSiteHeader />
    {props.children}
    <CommonSiteFooter />
  </>
);

export default App;
