const items = [
  {
    id: '1',
    name: 'Document 1',
    icon: 'file',
    isDirectory: true,
    parentId: null,
  },
  {
    id: '2',
    name: 'Document 2',
    icon: 'file',
    isDirectory: false,
    parentId: '1', 
  },
  {
    id: '3',
    name: 'Document 3',
    icon: 'file',
    isDirectory: false,
    parentId: '1',
  },
  {
    id: '4',
    name: 'Document 4',
    icon: 'file',
    isDirectory: true,
    parentId: null,
  },
  {
    id: '5',
    name: 'Document 5 rajshe khar das Document 5 rajshe khar dasDocument 5 rajshe khar das',
    icon: 'file',
    isDirectory: true,
    parentId: '4',
  }
];

export default {
  getItems() {
    return items;
  },
};
