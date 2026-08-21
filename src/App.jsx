import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Layout,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  UserAddOutlined,
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;
const STORAGE_KEY = 'user-directory.users.v1';

const starterUsers = [
  { id: 'starter-a', name: 'Mr A', age: 37, nickname: 'A' },
  { id: 'starter-b', name: 'Mr B', age: 22, nickname: 'B' },
];

const readUsers = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterUsers;
  } catch {
    return starterUsers;
  }
};

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export default function App() {
  const [users, setUsers] = useState(readUsers);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return users;
    return users.filter(({ name, nickname, age }) =>
      [name, nickname, String(age)].some((value) =>
        value.toLocaleLowerCase().includes(term),
      ),
    );
  }, [search, users]);

  const addUser = (values) => {
    setUsers((current) => [...current, { id: newId(), ...values }]);
    addForm.resetFields();
    setIsAddModalOpen(false);
    messageApi.success(`เพิ่ม ${values.name} เรียบร้อยแล้ว`);
  };

  const beginEdit = (record) => {
    setEditingId(record.id);
    editForm.setFieldsValue(record);
  };

  const saveEdit = async (id) => {
    try {
      const values = await editForm.validateFields();
      setUsers((current) =>
        current.map((user) => (user.id === id ? { ...user, ...values } : user)),
      );
      setEditingId(null);
      messageApi.success('บันทึกการแก้ไขแล้ว');
    } catch {
      // Ant Design displays validation feedback inside the edited row.
    }
  };

  const deleteUser = (id) => {
    setUsers((current) => current.filter((user) => user.id !== id));
    if (editingId === id) setEditingId(null);
    messageApi.success('ลบผู้ใช้แล้ว');
  };

  const columns = [
    {
      title: 'ลำดับ',
      key: 'index',
      width: 100,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'ชื่อ',
      dataIndex: 'name',
      key: 'name',
      render: (value, record) =>
        editingId === record.id ? (
          <Form.Item
            name="name"
            rules={[{ required: true, whitespace: true, message: 'กรุณากรอกชื่อ' }]}
          >
            <Input aria-label="แก้ไขชื่อ" maxLength={60} />
          </Form.Item>
        ) : (
          <Space>
            <Avatar className="name-avatar">{value.trim().charAt(0).toUpperCase()}</Avatar>
            <Text strong>{value}</Text>
          </Space>
        ),
    },
    {
      title: 'อายุ',
      dataIndex: 'age',
      key: 'age',
      width: 150,
      render: (value, record) =>
        editingId === record.id ? (
          <Form.Item
            name="age"
            rules={[{ required: true, message: 'กรุณากรอกอายุ' }]}
          >
            <InputNumber aria-label="แก้ไขอายุ" min={1} max={120} className="full-width" />
          </Form.Item>
        ) : (
          <Tag color="purple">{value} ปี</Tag>
        ),
    },
    {
      title: 'ชื่อเล่น',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (value, record) =>
        editingId === record.id ? (
          <Form.Item
            name="nickname"
            rules={[{ required: true, whitespace: true, message: 'กรุณากรอกชื่อเล่น' }]}
          >
            <Input aria-label="แก้ไขชื่อเล่น" maxLength={40} />
          </Form.Item>
        ) : (
          <Text type="secondary">{value}</Text>
        ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      width: 205,
      align: 'right',
      render: (_, record) =>
        editingId === record.id ? (
          <Space>
            <Tooltip title="บันทึก">
              <Button
                type="primary"
                shape="circle"
                aria-label="บันทึก"
                icon={<CheckOutlined />}
                onClick={() => saveEdit(record.id)}
              />
            </Tooltip>
            <Tooltip title="ยกเลิก">
              <Button
                shape="circle"
                aria-label="ยกเลิก"
                icon={<CloseOutlined />}
                onClick={() => setEditingId(null)}
              />
            </Tooltip>
          </Space>
        ) : (
          <Space>
            <Tooltip title="แก้ไข">
              <Button
                className="action-button edit-button"
                shape="circle"
                aria-label="แก้ไข"
                icon={<EditOutlined />}
                disabled={editingId !== null}
                onClick={() => beginEdit(record)}
              />
            </Tooltip>
            <Popconfirm
              title="ลบผู้ใช้นี้?"
              description="ข้อมูลที่ลบแล้วไม่สามารถกู้คืนได้"
              okText="ลบ"
              cancelText="ยกเลิก"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteUser(record.id)}
            >
              <Tooltip title="ลบ">
                <Button
                  className="action-button"
                  shape="circle"
                  danger
                  aria-label="ลบ"
                  icon={<DeleteOutlined />}
                  disabled={editingId !== null}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <Layout className="app-shell">
      {contextHolder}
      <Content className="page-content">
        <Card className="table-card" bordered={false}>
          <Flex justify="space-between" align="center" gap={20} wrap className="card-heading">
            <div>
              <Title level={2}>จัดการรายชื่อบุคคล</Title>
              <Text type="secondary">เพิ่ม แก้ไข หรือลบข้อมูลรายชื่อบุคคล</Text>
            </div>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
              เพิ่มบุคคล
            </Button>
          </Flex>

          <Flex justify="space-between" align="center" gap={12} wrap className="table-toolbar">
            <Text type="secondary">พบ {filteredUsers.length} จากทั้งหมด {users.length} รายการ</Text>
            <Flex gap={10} wrap className="toolbar-actions">
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="ค้นหาชื่อ อายุ หรือชื่อเล่น"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="search-input"
              />
            </Flex>
          </Flex>
          <Form form={editForm} component={false}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filteredUsers}
              pagination={false}
              rowHoverable={false}
              scroll={{ x: 860 }}
              locale={{ emptyText: <Empty description="ยังไม่มีข้อมูลผู้ใช้" /> }}
              rowClassName={(record, index) => {
                if (record.id === editingId) return 'editing-row';
                return index % 2 === 0 ? 'user-row-even' : 'user-row-odd';
              }}
            />
          </Form>
        </Card>

        <Modal
          open={isAddModalOpen}
          title={
            <Flex align="center" gap={12}>
              <span className="icon-tile modal-icon"><UserAddOutlined /></span>
              <div>
                <Title level={4}>เพิ่มสมาชิกใหม่</Title>
                <Text type="secondary">กรอกข้อมูลให้ครบทั้ง 3 ช่อง</Text>
              </div>
            </Flex>
          }
          onCancel={() => {
            setIsAddModalOpen(false);
            addForm.resetFields();
          }}
          footer={null}
          destroyOnHidden
          width={520}
        >
          <Form form={addForm} layout="vertical" onFinish={addUser} requiredMark={false} className="add-form">
            <Form.Item label="ชื่อ" name="name" rules={[{ required: true, whitespace: true, message: 'กรุณากรอกชื่อ' }]}>
              <Input placeholder="เช่น สมชาย ใจดี" maxLength={60} autoFocus />
            </Form.Item>
            <Form.Item label="อายุ" name="age" rules={[{ required: true, message: 'กรุณากรอกอายุ' }]}>
              <InputNumber placeholder="18" min={1} max={120} className="full-width" />
            </Form.Item>
            <Form.Item label="ชื่อเล่น" name="nickname" rules={[{ required: true, whitespace: true, message: 'กรุณากรอกชื่อเล่น' }]}>
              <Input placeholder="เช่น บอล" maxLength={40} />
            </Form.Item>
            <Flex justify="flex-end" gap={10} className="modal-actions">
              <Button onClick={() => {
                setIsAddModalOpen(false);
                addForm.resetFields();
              }}>
                ยกเลิก
              </Button>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                เพิ่มผู้ใช้
              </Button>
            </Flex>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
