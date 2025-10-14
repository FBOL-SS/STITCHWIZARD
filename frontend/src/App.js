import React, { useState } from 'react';
import OperationsCRUD from './components/OperationsCRUD';
import WorkersCRUD from './components/WorkersCRUD';
import StylesCRUD from './components/StylesCRUD';
import Calculator from './components/Calculator';
import Export from './components/Export';

function App() {
  const [activeTab, setActiveTab] = useState('operations');

  return (
    <div className="App">
      <nav className="sidebar">
        <h2>StitchWizard</h2>
        <a href="#" onClick={() => setActiveTab('operations')}>Operations CRUD</a>
        <a href="#" onClick={() => setActiveTab('workers')}>Workers CRUD</a>
        <a href="#" onClick={() => setActiveTab('styles')}>Styles CRUD</a>
        <a href="#" onClick={() => setActiveTab('calculator')}>Calculator</a>
        <a href="#" onClick={() => setActiveTab('export')}>Export</a>
      </nav>
      <main className="content">
        {activeTab === 'operations' && <OperationsCRUD />}
        {activeTab === 'workers' && <WorkersCRUD />}
        {activeTab === 'styles' && <StylesCRUD />}
        {activeTab === 'calculator' && <Calculator />}
        {activeTab === 'export' && <Export />}
      </main>
    </div>
  );
}

export default App;
