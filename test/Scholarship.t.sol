// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "../lib/forge-std/src/Test.sol";
import "../src/Scholarship.sol";

contract ScholarshipTest is Test {

    Scholarship scholarship;

    address provider = makeAddr("provider");

    function setUp() public {
        scholarship = new Scholarship();

        // Register the main test provider for tests that create scholarships.
        scholarship.registerProvider();
    }

    function testRegisterProvider() public {
        Scholarship newScholarship = new Scholarship();

        assertFalse(newScholarship.isProvider(address(this)));

        newScholarship.registerProvider();

        assertTrue(newScholarship.isProvider(address(this)));
    }

    function testCannotRegisterProviderTwice() public {
        vm.expectRevert("Already registered as provider");
        scholarship.registerProvider();
    }

    function testUnregisteredProviderCannotCreateScholarship() public {
        Scholarship newScholarship = new Scholarship();

        address unregisteredProvider = makeAddr("unregisteredProvider");

        vm.deal(unregisteredProvider, 1 ether);

        vm.prank(unregisteredProvider);
        vm.expectRevert("Not a registered provider");

        newScholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );
    }

    function testRegisteredProviderCanCreateScholarship() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        assertEq(scholarship.scholarshipCount(), 1);

        (
            ,
            address scholarshipProvider,
            ,
            ,
            ,
            ,
            ,
            bool active
        ) = scholarship.scholarships(1);

        assertEq(scholarshipProvider, address(this));
        assertTrue(active);
    }

    function testCreateScholarship() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        assertEq(scholarship.scholarshipCount(), 1);
    }

    function testApplyForScholarship() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        address student = makeAddr("student");

        vm.prank(student);
        scholarship.applyForScholarship(1);

        (, bool exists, , ) = scholarship.applications(1, student);

        assertTrue(exists);
    }

    function testApproveApplication() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        address student = makeAddr("student");

        vm.prank(student);
        scholarship.applyForScholarship(1);

        scholarship.approveApplication(1, student);

        (, bool exists, bool approved, ) =
            scholarship.applications(1, student);

        assertTrue(exists);
        assertTrue(approved);
    }

    function testOnlyProviderCanApprove() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        address student = makeAddr("student");
        address stranger = makeAddr("stranger");

        vm.prank(student);
        scholarship.applyForScholarship(1);

        vm.prank(stranger);
        vm.expectRevert("Not the scholarship provider");

        scholarship.approveApplication(1, student);
    }

    function testPayScholarship() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        address student = makeAddr("student");

        vm.prank(student);
        scholarship.applyForScholarship(1);

        scholarship.approveApplication(1, student);

        uint256 studentBalanceBefore = student.balance;

        scholarship.payScholarship(1, student);

        uint256 studentBalanceAfter = student.balance;

        assertEq(
            studentBalanceAfter - studentBalanceBefore,
            1 ether
        );

        (, , bool approved, bool paid) =
            scholarship.applications(1, student);

        assertTrue(approved);
        assertTrue(paid);
    }

    function testCannotPayUnapprovedApplication() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        address student = makeAddr("student");

        vm.prank(student);
        scholarship.applyForScholarship(1);

        vm.expectRevert("Application not approved");

        scholarship.payScholarship(1, student);
    }

    function testOnlyProviderCanPay() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        address student = makeAddr("student");
        address stranger = makeAddr("stranger");

        vm.prank(student);
        scholarship.applyForScholarship(1);

        scholarship.approveApplication(1, student);

        vm.prank(stranger);
        vm.expectRevert("Not the scholarship provider");

        scholarship.payScholarship(1, student);
    }

    function testCannotPayScholarshipTwice() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        address student = makeAddr("student");

        vm.prank(student);
        scholarship.applyForScholarship(1);

        scholarship.approveApplication(1, student);

        scholarship.payScholarship(1, student);

        vm.expectRevert("Scholarship already paid");

        scholarship.payScholarship(1, student);
    }

    function testCannotApplyTwice() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        address student = makeAddr("student");

        vm.startPrank(student);

        scholarship.applyForScholarship(1);

        vm.expectRevert("Already applied");

        scholarship.applyForScholarship(1);

        vm.stopPrank();
    }

    function testCannotApplyAfterDeadline() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 1 days,
            10
        );

        address student = makeAddr("student");

        vm.warp(block.timestamp + 2 days);

        vm.prank(student);
        vm.expectRevert("Application deadline has passed");

        scholarship.applyForScholarship(1);
    }

    function testCannotApplyWhenMaxApplicantsReached() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 1 days,
            2
        );

        address student1 = makeAddr("student1");
        address student2 = makeAddr("student2");
        address student3 = makeAddr("student3");

        vm.prank(student1);
        scholarship.applyForScholarship(1);

        vm.prank(student2);
        scholarship.applyForScholarship(1);

        vm.prank(student3);
        vm.expectRevert("Scholarship is full");

        scholarship.applyForScholarship(1);
    }

    function testCancelScholarship() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        uint256 balanceBefore = address(this).balance;

        scholarship.cancelScholarship(1);

        uint256 balanceAfter = address(this).balance;

        assertEq(balanceAfter, balanceBefore + 1 ether);

        (, , , , , , , bool active) =
            scholarship.scholarships(1);

        assertFalse(active);
    }

    receive() external payable {}

    function testOnlyProviderCanCancel() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        address student = makeAddr("student");

        vm.prank(student);

        vm.expectRevert("Not the scholarship provider");

        scholarship.cancelScholarship(1);
    }

    function testCannotCancelScholarshipTwice() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        scholarship.cancelScholarship(1);

        vm.expectRevert("Scholarship is not active");

        scholarship.cancelScholarship(1);
    }

    function testCannotCancelNonExistentScholarship() public {
        vm.expectRevert("Scholarship does not exist");

        scholarship.cancelScholarship(1);
    }

    function testCannotCreateScholarshipWithZeroAmount() public {
        vm.expectRevert("Amount must be greater than zero");

        scholarship.createScholarship(
            "Invalid Scholarship",
            "This should fail",
            0,
            block.timestamp + 7 days,
            10
        );
    }

    function testCannotCreateScholarshipWithPastDeadline() public {
        vm.expectRevert("Deadline must be in the future");

        scholarship.createScholarship{value: 1 ether}(
            "Invalid Scholarship",
            "This should fail",
            1 ether,
            block.timestamp - 1,
            10
        );
    }

    function testCannotCreateScholarshipWithIncorrectFunding() public {
        vm.expectRevert("Incorrect funding amount");

        scholarship.createScholarship{value: 0.5 ether}(
            "Invalid Scholarship",
            "This should fail",
            1 ether,
            block.timestamp + 7 days,
            10
        );
    }

    function testCannotCreateScholarshipWithZeroMaxApplicants() public {
        vm.expectRevert("Must allow at least one applicant");

        scholarship.createScholarship{value: 1 ether}(
            "Invalid Scholarship",
            "This should fail",
            1 ether,
            block.timestamp + 7 days,
            0
        );
    }

    function testCannotApplyToNonExistentScholarship() public {
        vm.expectRevert("Scholarship does not exist");

        scholarship.applyForScholarship(1);
    }

    function testCannotApplyToCancelledScholarship() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        scholarship.cancelScholarship(1);

        vm.expectRevert("Scholarship is not active");

        scholarship.applyForScholarship(1);
    }

    function testCannotApproveNonExistentScholarship() public {
        vm.expectRevert("Scholarship does not exist");

        scholarship.approveApplication(1, address(this));
    }

    function testCannotApproveNonApplicant() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        vm.expectRevert("Application does not exist");

        scholarship.approveApplication(1, address(this));
    }

    function testCannotApproveApplicationTwice() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        address student = makeAddr("student");

        vm.prank(student);
        scholarship.applyForScholarship(1);

        scholarship.approveApplication(1, student);

        vm.expectRevert("Already approved");

        scholarship.approveApplication(1, student);
    }

    function testCannotPayNonExistentScholarship() public {
        vm.expectRevert("Scholarship does not exist");

        scholarship.payScholarship(1, address(this));
    }

    function testCannotPayNonApplicant() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        vm.expectRevert("Application not approved");

        scholarship.payScholarship(1, address(this));
    }

    function testCannotPayScholarshipAfterItWasPaid() public {
        scholarship.createScholarship{value: 1 ether}(
            "Tech Scholarship",
            "Scholarship for blockchain students",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        address student = makeAddr("student");

        vm.prank(student);
        scholarship.applyForScholarship(1);

        scholarship.approveApplication(1, student);

        scholarship.payScholarship(1, student);

        vm.expectRevert("Scholarship already paid");

        scholarship.payScholarship(1, student);
    }

    function testScholarshipCountIncreases() public {
        scholarship.createScholarship{value: 1 ether}(
            "Scholarship One",
            "First scholarship",
            1 ether,
            block.timestamp + 7 days,
            10
        );

        assertEq(scholarship.scholarshipCount(), 1);

        scholarship.createScholarship{value: 2 ether}(
            "Scholarship Two",
            "Second scholarship",
            2 ether,
            block.timestamp + 14 days,
            20
        );

        assertEq(scholarship.scholarshipCount(), 2);
    }

    function testScholarshipBecomesInactiveAfterPayment() public {
        address localProvider = makeAddr("localProvider");
        address student = makeAddr("student");

        vm.deal(localProvider, 1 ether);

        vm.prank(localProvider);
        scholarship.registerProvider();

        vm.prank(localProvider);
        scholarship.createScholarship{value: 0.5 ether}(
            "Tech Scholarship",
            "Blockchain scholarship",
            0.5 ether,
            block.timestamp + 7 days,
            5
        );

        vm.prank(student);
        scholarship.applyForScholarship(1);

        vm.prank(localProvider);
        scholarship.approveApplication(1, student);

        vm.prank(localProvider);
        scholarship.payScholarship(1, student);

        (, , , , , , , bool active) =
            scholarship.scholarships(1);

        assertFalse(active);
    }

    function testCannotCancelScholarshipAfterPayment() public {
        address localProvider = makeAddr("localProvider");
        address student = makeAddr("student");

        vm.deal(localProvider, 1 ether);

        vm.prank(localProvider);
        scholarship.registerProvider();

        vm.prank(localProvider);
        scholarship.createScholarship{value: 0.5 ether}(
            "Tech Scholarship",
            "Blockchain scholarship",
            0.5 ether,
            block.timestamp + 7 days,
            5
        );

        vm.prank(student);
        scholarship.applyForScholarship(1);

        vm.prank(localProvider);
        scholarship.approveApplication(1, student);

        vm.prank(localProvider);
        scholarship.payScholarship(1, student);

        vm.prank(localProvider);
        vm.expectRevert("Scholarship is not active");

        scholarship.cancelScholarship(1);
    }
}