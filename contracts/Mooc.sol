pragma solidity ^0.4.24;

contract CourseList{
    address public admin;
    address[] public courses;
    bytes23[] public questions;
    constructor() public {
        admin = msg.sender;
    }

    function createQa(bytes23 _hash1, bytes23 _hash2) public {
        questions.push(_hash1);
        questions.push(_hash2);
    }

    function getQa() public view returns (bytes23[]) {
        return questions;
    }

    function updateQa(uint _index, bytes23 _hash1, bytes23 _hash2) public {
        questions[_index*2] = _hash1;
        questions[_index*2+1] = _hash2;
    }

    function removeQa(uint _index) public {
        uint len = questions.length;

        for(uint i=_index; i<len-2; i=i+2){
            questions[i] = questions[i+2];
            questions[i+1] = questions[i+3];
        }

        delete questions[len-1];
        delete questions[len-2];
        questions.length = questions.length - 2;
    }

    function createCourse(string _name, string _content, uint _target,
        uint _fundingPrice, uint _price, string _image) public{

        address newCourse = new Course(admin, msg.sender, _name, _content, _target, _fundingPrice,
            _price, _image);
        courses.push(newCourse);
    }

    function getCourse() public view returns(address[]){
        return courses;
    }

    function removeCourse(uint _index) public{
        require(msg.sender == admin);

        require(_index < courses.length);

        uint len = courses.length;

        for(uint i=_index; i<len-1; i++){
            courses[i] = courses[i+1];
        }

        delete courses[len-1];
        courses.length--;
    }

    function isAdmin() public view returns(bool){
        return msg.sender == admin;
    }
    
}

contract Course{
    address public admin;
    address public owner;
    string public name;
    string public content;
    uint public target;
    uint public fundingPrice;
    uint public price;
    string public image;
    string public video;
    bool public isOnline;
    uint public count;

    mapping(address=>uint) public users;

    constructor(address _admin, address _owner, string _name, string _content, uint _target,
        uint _fundingPrice, uint _price, string _image) public{
       
        admin = _admin;
        owner = _owner;
        name = _name;
        content = _content;
        target = _target;
        fundingPrice = _fundingPrice;
        price = _price;
        image = _image;
        video = "";
        count = 0;
        isOnline = false;
    }

    function buy() public payable {
        require (users[msg.sender] == 0);
        if(isOnline){
            require(price == msg.value);
        }else{
            require(fundingPrice == msg.value);
        }
        users[msg.sender] = msg.value;

        count += 1;

        if(target <= count * fundingPrice){
            if(isOnline){
                uint value = msg.value;

                admin.transfer(value/10);
                owner.transfer(value - value/10);
            }else{
                isOnline = true;
                owner.transfer(count * fundingPrice);
            }
        }
        
    }

    function addVideo(string _video) public{
        require(msg.sender == owner);
        require(isOnline == true);
        video = _video;
    }


    function getDetail() public view returns(string, string, uint, uint, uint, string, string, uint, bool, uint){
        uint role;
        if(owner == msg.sender){
            role = 0;
        }else if(users[msg.sender] > 0){
            role = 1;
        }else{
            role = 2;
        }

        return (
            name, content, target, fundingPrice, 
            price, image, video, count, isOnline, role);

    }
}
