import { type ParentComponent } from 'solid-js';
import CommonSiteHeader from './components/common/CommonSiteHeader/CommonSiteHeader';
import NetworkStatusBanner from './components/common/NetworkStatusBanner/NetworkStatusBanner';

const App: ParentComponent = (props) => (
  <>
    <CommonSiteHeader />
    <NetworkStatusBanner />
    {props.children}
  </>
);

export default App;
