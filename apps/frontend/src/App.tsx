import { type ParentComponent } from 'solid-js';
import CommonErrorBoundary from './components/common/CommonErrorBoundary/CommonErrorBoundary';
import CommonSiteHeader from './components/common/CommonSiteHeader/CommonSiteHeader';
import NetworkStatusBanner from './components/common/NetworkStatusBanner/NetworkStatusBanner';

const App: ParentComponent = (props) => (
  <>
    <CommonSiteHeader />
    <NetworkStatusBanner />
    <CommonErrorBoundary>{props.children}</CommonErrorBoundary>
  </>
);

export default App;
