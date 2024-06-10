import { addRule, removeRule, rule, updateRule } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, FormInstance, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, Input, Popover, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
// import UpdateForm from './components/UpdateForm';
import LandDescription from '../LandDescription';
// import { getLandInfo } from '../Admin';
import LandRegister from '../LandRegister';
import CreateTransaction from '../CreateTransaction';
import TransactionInfo from '../TransactionInfo';
import { UpdateLand, getAllLandList, getLandListByKey, getTransactionListByKey } from '@/services/request';





const TableList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<any>();
  const [transitions, setTransactions] = useState<any>();
  const [openPass, setOpenPass] = useState(false);
  const [openNoPass, setOpenNoPass] = useState(false);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const userInfo = JSON.parse(sessionStorage.getItem('user_info')!);

  useEffect(() => {
    // console.log('rereqq' , currentRow)
    if (!currentRow || !currentRow.landId)
      return;

    getTransactionListByKey({
      key: 'landId',
      value: currentRow.landId
    }).then((res) => {
      // console.log(res);
      if (res.status !== 'ok')
        message.error(res.info)
      else {
        const __data__ = JSON.parse(res.data === '' ? "[]" : res.data);
        console.log('1111', __data__);
        setTransactions(__data__);
      }
    });

  }, [showDetail])

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const columns = [
    {
      title: "位置",
      dataIndex: 'position',
      tip: '土地的区县范围位置',
      render: (dom: any, entity: any) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {entity.position.replaceAll(',', '-')}
          </a>
        );
      },
    },
    {
      title: "拥有者",
      dataIndex: 'owner',
    },
    {
      title: "大小",
      dataIndex: 'size',
      hideInSearch: true
    },
    {
      title: "标价",
      dataIndex: 'price',
      hideInSearch: true
    },
    {
      title: "验证",
      dataIndex: 'valid',
      hideInForm: true,
      valueEnum: {
        Yes: {
          text: "已审核",
          status: 'Success',
        },
        No: {
          text: "未审核",
          status: 'Processing',
        },
        Error: {
          text: "不通过",
          status: 'Error',
        },
      },
    },
    {
      title: "流转状态",
      dataIndex: 'inTransaction',
      hideInForm: true,
      valueEnum: {
        true: {
          text: "流转中",
          status: 'Processing',
        },
        false: {
          text: "可流转",
          status: 'Success',
        }
      },
    },
    {
      title: "Operating",
      dataIndex: 'option',
      valueType: 'option',
      render: (_: any, record: any) => (
        userInfo.userid !== 'admin' ? [
          <a
            key="流转"
            onClick={() => {
              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            申请流转
          </a>
        ] : [
          <Button key="yanzheng"
            type="link"
            disabled={record.valid === 'Yes'}
            onClick={() => {
              UpdateLand({
                landId: record.landId,
                key: 'valid',
                value: 'Yes'
              }).then(res => {
                if (res.status !== 'ok')
                  message.error(res.info)
                else
                  setOpenPass(false);

                actionRef.current?.reload();
              })
            }}
          >通过验证</Button>,

          <Button key="no" type="link"
            disabled={record.valid === 'Error'}
            onClick={() => {
              UpdateLand({
                landId: record.landId,
                key: 'valid',
                value: 'Error'
              }).then(res => {
                if (res.status !== 'ok')
                  message.error(res.info)
                else
                  setOpenPass(false);

                actionRef.current?.reload();
              })
            }}>不通过</Button>,
        ]
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable
        headerTitle={'所有土地'}
        actionRef={actionRef}
        formRef={formRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            disabled={userInfo.userid === 'admin'}
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> 土地登记
          </Button>,
        ]}
        request={async () => {
          const value = formRef.current?.getFieldsValue();
          const p: any = {};
          for (let item in value) {
            if (value[item]) {
              p['key'] = item
              p['value'] = value[item]
              break
            }
          }

          let res;
          if (p['key'] && p['key'] !== 'position')
            res = await getLandListByKey({
              key: p['key'],
              value: p['value']
            })
          else
            res = await getAllLandList();

          if (res.status === 'ok') {
            const __data__: any[] = JSON.parse(res.data === '' ? "[]" : res.data);

            const d = [];

            for (let element of __data__) {
              if (value.position && element.position.indexOf(value['position']) == -1)
                continue
              if (value.owner && element.owner !== value.owner)
                continue
              if (value.inTransaction && element.inTransaction !== value.inTransaction)
                continue
              if (value.valid && element.valid !== value.valid)
                continue

              console.log(element);
              d.push(element)
            }

            console.log(__data__)

            return {
              success: true,
              data: d,
              total: __data__.length
            }
          }

          return {
            success: false
          }
        }}
        columns={columns}
      // rowSelection={{
      //   onChange: (_, selectedRows) => {
      //     setSelectedRows(selectedRows as any);
      //   },
      // }}
      />
      {/* {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              Chosen{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              项
              &nbsp;&nbsp;
              <span>
                Total number of service calls{' '}
                {selectedRowsState.reduce((pre, item) => pre + item.callNo!, 0)}{' '}
                万
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            Batch deletion
          </Button>
          <Button type="primary">
            Batch approval
          </Button>
        </FooterToolbar>
      )} */}

      <LandRegister createModalOpen={createModalOpen} setCreateModalOpen={(v: boolean) => handleModalOpen(v)} reload={() => actionRef?.current?.reload()} />

      <CreateTransaction createModalOpen={updateModalOpen} setCreateModalOpen={(v: boolean) => handleUpdateModalOpen(v)} land={currentRow || {}} />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {
          // @ts-ignore
          currentRow?.position && (
            <>
              <LandDescription land={currentRow as any} />

              {transitions?.map((transition: any, index: number) => {
                // console.log(transition);
                return <TransactionInfo transaction={transition} title={index === 0 ? "流转记录" : null} />
              })}
            </>
          )
        }
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
