import { ParentComponent } from 'solid-js';
import CommonSiteHeader from './components/common/CommonSiteHeader/CommonSiteHeader';
import CommonSiteFooter from './components/common/CommonSiteFooter/CommonSiteFooter';

const App: ParentComponent = (props) => (
  <>
    <CommonSiteHeader />
    {props.children}
    <CommonSiteFooter />
  </>
);

export default App;
