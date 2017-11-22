import { TSF } from 'tsf-web';
import { TodoComponent } from './todo';

const app = new TSF('#app');
app.run(new TodoComponent());
