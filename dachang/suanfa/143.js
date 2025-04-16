/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {void} Do not return anything, modify head in-place instead.
 */

function reorderList(head) {
    let slow = head;
    let fast = head;
    while (fast && fast.next) {
        slow = slow.next; //2
        fast = fast.next.next;  //3
    }

    let pre = null;
    let cur = slow;
    while (cur) {
        let next = cur.next;
        cur.next = pre;
        pre = cur;
        cur = next;
    }

    let p1 = head; 1 
    let p2 = pre; 5
    while (p1 && p2) {
        let next1 = p1.next; //2
        let next2 = p2.next; //4
        p1.next = p2; //1->5
        p2.next = next1; //4->2
        p1 = next1; //2
        p2 = next2; //4
    }
}
// // 创建链表
// let node4 = new ListNode(4);
// let node3 = new ListNode(3, node4);
// let node2 = new ListNode(2, node3);
// let node1 = new ListNode(1, node2);

reorderList(node1)
