import 'devextreme/dist/css/dx.light.css';
import React, { useCallback, useRef, useState } from 'react';
import TreeView from 'devextreme-react/tree-view';
import Sortable from 'devextreme-react/sortable';
import service from './data.js';
import './App.css';

const App = () => {
  const treeViewRef = useRef(null);
  const [items, setItems] = useState(service.getItems());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getTreeView = useCallback(() => treeViewRef.current.instance(), []);

  const calculateToIndex = (e) => {
    if (e.fromComponent !== e.toComponent || e.dropInsideItem) {
      return e.toIndex;
    }
    return e.fromIndex >= e.toIndex ? e.toIndex : e.toIndex + 1;
  };

  const findNode = (treeView, index) => {
    const nodeElement = treeView.element().querySelectorAll('.dx-treeview-node')[index];
    if (nodeElement) {
      return findNodeById(treeView.getNodes(), nodeElement.getAttribute('data-item-id'));
    }
    return null;
  };

  const findNodeById = (nodes, id) => {
    for (let i = 0; i < nodes.length; i += 1) {
      if (nodes[i].itemData.id === id) {
        return nodes[i];
      }
      if (nodes[i].children) {
        const node = findNodeById(nodes[i].children, id);
        if (node != null) {
          return node;
        }
      }
    }
    return null;
  };

  const isChild = (fromNode, toNode) => {
    if (toNode === null) return false;
    for (let i = 0; i < fromNode.items.length; i++) {
      const item = fromNode.items[i];
      if (item.key === toNode.key) return true;
      if (item?.items?.length && isChild(item, toNode)) return true;
    }
    return false;
  };

  const onDragChange = useCallback(
    (e) => {
      if (e.fromComponent === e.toComponent) {
        const fromNode = findNode(getTreeView(), e.fromIndex);
        const toNode = findNode(getTreeView(), calculateToIndex(e));
      }
    },
    [getTreeView, calculateToIndex]
  );

  const onDragEnd = useCallback(
    (e) => {
      if (e.fromComponent === e.toComponent && e.fromIndex === e.toIndex) {
        return;
      }
      const fromTreeView = getTreeView();
      const toTreeView = getTreeView();
      const fromNode = findNode(fromTreeView, e.fromIndex);
      const toNode = findNode(toTreeView, calculateToIndex(e));
      
      if (e.dropInsideItem && toNode === null) {
        return;
      }

      let toItems = [...items];
      const fromIndex = toItems.findIndex((item) => item.id === fromNode.itemData.id);
      toItems.splice(fromIndex, 1);

      if (isChild(fromNode, toNode)) {
        toItems = toItems.map((item) => ({
          ...item,
          parentId: item.parentId === fromNode.itemData.id ? (fromNode.parent?.itemData?.id || fromNode.parent) : item.parentId
        }));
      }

      if (toNode === null) {
        fromNode.itemData.parentId = null;
        fromNode.itemData.expanded = true;
        toItems.push(fromNode.itemData);
      } else if (e.dropInsideItem) {
        fromNode.itemData.parentId = toNode.itemData.id;
        toNode.children = toNode.children || [];
        toItems.push(fromNode.itemData);
      } else {
        fromNode.itemData.parentId = toNode.itemData.parentId;
        toItems.splice(e.toIndex, 0, fromNode.itemData);
      }

      setItems(toItems);
    },
    [findNode, getTreeView, items]
  );

  const onSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setSearchResults([]);
      setCurrentIndex(0);
      return;
    }

    const results = items.filter(item => item.name.toLowerCase().includes(query));
    setSearchResults(results);
    setCurrentIndex(0);
  };

  const goToNextResult = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % searchResults.length);
  };

  const goToPrevResult = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + searchResults.length) % searchResults.length);
  };

  const currentItem = searchResults.length > 0 ? searchResults[currentIndex] : null;

  const expandAll = () => {
    const treeView = getTreeView();
    treeView.expandAll();
  };

  const collapseAll = () => {
    const treeView = getTreeView();
    treeView.collapseAll();
  };

  const toolbar = (
    <div className="form">
      <div className="drive-panel">
        <div>
          <button onClick={expandAll}>Expand All</button>
          <button onClick={collapseAll}>Collapse All</button>
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search..."
          />
          <button onClick={goToPrevResult} disabled={searchResults.length === 0}>
            &lt;
          </button>
          <button onClick={goToNextResult} disabled={searchResults.length === 0}>
            &gt;
          </button>
          <span>{`${searchResults.length > 0 ? currentIndex + 1 : 0} / ${searchResults.length}`}</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {toolbar}
      <Sortable
        filter=".dx-treeview-item"
        group="shared"
        data="documents"
        allowDropInsideItem={true}
        allowReordering={true}
        onDragChange={onDragChange}
        onDragEnd={onDragEnd}
      >
        <TreeView
          id="treeviewDocuments"
          expandNodesRecursive={true}
          dataStructure="plain"
          ref={treeViewRef}
          items={items}
          expandIcon={'plus'}
          collapseIcon={'minus'}
          displayExpr="name"
          itemRender={(item) => (
            <div
              className="item-box"
              style={{
                boxShadow: currentItem && currentItem.id === item.id ? '0 0 0px 3px red' : '0px 2px 0px 2px #8080803d'
              }}
            >
              <span className="item-drag">&#8801;</span>
              {item.name}
            </div>
          )}
        />
      </Sortable>
    </>
  );
};

export default App;
