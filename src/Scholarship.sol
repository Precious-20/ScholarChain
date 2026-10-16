// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract Scholarship {
    struct ScholarshipData {
        uint256 id;
        address provider;
        string title;
        string description;
        uint256 amount;
        uint256 deadline;
        uint256 maxApplicants;
        bool active;
    }

    struct Application {
        address student;
        bool exists;
        bool approved;
        bool paid;
    }

    mapping(uint256 => ScholarshipData) public scholarships;
    mapping(uint256 => mapping(address => Application)) public applications;
    mapping(uint256 => uint256) public applicantCount;

    // Provider registration
    mapping(address => bool) public registeredProviders;

    uint256 public scholarshipCount;

    event ProviderRegistered(address indexed provider);

    event ScholarshipCreated(
        uint256 indexed scholarshipId,
        address indexed provider,
        string title,
        uint256 amount
    );

    event ScholarshipApplied(
        uint256 indexed scholarshipId,
        address indexed student
    );

    event ScholarshipApproved(
        uint256 indexed scholarshipId,
        address indexed student
    );

    event ScholarshipPaid(
        uint256 indexed scholarshipId,
        address indexed student,
        uint256 amount
    );

    event ScholarshipCancelled(
        uint256 indexed scholarshipId,
        address indexed provider
    );

    function registerProvider() public {
        require(
            !registeredProviders[msg.sender],
            "Already registered as provider"
        );

        registeredProviders[msg.sender] = true;

        emit ProviderRegistered(msg.sender);
    }

    function isProvider(address _provider) public view returns (bool) {
        return registeredProviders[_provider];
    }

    function createScholarship(
        string memory _title,
        string memory _description,
        uint256 _amount,
        uint256 _deadline,
        uint256 _maxApplicants
    ) public payable {
        require(
            registeredProviders[msg.sender],
            "Not a registered provider"
        );

        require(
            _amount > 0,
            "Amount must be greater than zero"
        );

        require(
            _deadline > block.timestamp,
            "Deadline must be in the future"
        );

        require(
            _maxApplicants > 0,
            "Must allow at least one applicant"
        );

        require(
            msg.value == _amount,
            "Incorrect funding amount"
        );

        scholarshipCount++;

        scholarships[scholarshipCount] = ScholarshipData({
            id: scholarshipCount,
            provider: msg.sender,
            title: _title,
            description: _description,
            amount: _amount,
            deadline: _deadline,
            maxApplicants: _maxApplicants,
            active: true
        });

        emit ScholarshipCreated(
            scholarshipCount,
            msg.sender,
            _title,
            _amount
        );
    }

    function applyForScholarship(
        uint256 _scholarshipId
    ) public {
        ScholarshipData memory scholarship =
            scholarships[_scholarshipId];

        require(
            scholarship.id != 0,
            "Scholarship does not exist"
        );

        require(
            scholarship.active,
            "Scholarship is not active"
        );

        require(
            block.timestamp < scholarship.deadline,
            "Application deadline has passed"
        );

        require(
            applicantCount[_scholarshipId] <
                scholarship.maxApplicants,
            "Scholarship is full"
        );

        require(
            !applications[_scholarshipId][msg.sender].exists,
            "Already applied"
        );

        applications[_scholarshipId][msg.sender] = Application({
            student: msg.sender,
            exists: true,
            approved: false,
            paid: false
        });

        applicantCount[_scholarshipId]++;

        emit ScholarshipApplied(
            _scholarshipId,
            msg.sender
        );
    }

    function approveApplication(
        uint256 _scholarshipId,
        address _student
    ) public {
        ScholarshipData memory scholarship =
            scholarships[_scholarshipId];

        require(
            scholarship.id != 0,
            "Scholarship does not exist"
        );

        require(
            msg.sender == scholarship.provider,
            "Not the scholarship provider"
        );

        require(
            applications[_scholarshipId][_student].exists,
            "Application does not exist"
        );

        require(
            !applications[_scholarshipId][_student].approved,
            "Already approved"
        );

        applications[_scholarshipId][_student].approved = true;

        emit ScholarshipApproved(
            _scholarshipId,
            _student
        );
    }

    function payScholarship(
        uint256 _scholarshipId,
        address _student
    ) public {
        ScholarshipData storage scholarship =
            scholarships[_scholarshipId];

        require(
            scholarship.id != 0,
            "Scholarship does not exist"
        );

        require(
            msg.sender == scholarship.provider,
            "Not the scholarship provider"
        );

        require(
            applications[_scholarshipId][_student].approved,
            "Application not approved"
        );

        require(
            !applications[_scholarshipId][_student].paid,
            "Scholarship already paid"
        );

        applications[_scholarshipId][_student].paid = true;
        scholarship.active = false;

        emit ScholarshipPaid(
            _scholarshipId,
            _student,
            scholarship.amount
        );

        (bool success, ) =
            payable(_student).call{
                value: scholarship.amount
            }("");

        require(success, "Payment failed");
    }

    function cancelScholarship(
        uint256 _scholarshipId
    ) public {
        ScholarshipData storage scholarship =
            scholarships[_scholarshipId];

        require(
            scholarship.id != 0,
            "Scholarship does not exist"
        );

        require(
            msg.sender == scholarship.provider,
            "Not the scholarship provider"
        );

        require(
            scholarship.active,
            "Scholarship is not active"
        );

        scholarship.active = false;

        emit ScholarshipCancelled(
            _scholarshipId,
            scholarship.provider
        );

        (bool success, ) =
            payable(scholarship.provider).call{
                value: scholarship.amount
            }("");

        require(success, "Refund failed");
    }
}