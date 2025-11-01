<div style="text-align: center;">
  <img width="512" height="512" alt="image" src="https://github.com/user-attachments/assets/0aaef29d-a83d-44f4-8c54-c4cafa9d22f8" />
</div>

  
# :eggplant: MKFood : 냉장고 관리 및 레시피 추천 서비스  
  
> 1인 가구 및 자취생을 위한 스마트한 식재료 관리 및 맞춤형 레시피 추천 풀스택 웹 애플리케이션입니다. 낭비되는 식재료를 줄이고, 보유한 재료로 만들 수 있는 요리를 간편하게 찾을 수 있도록 돕습니다.  
  
<br>  
  

  
## 📌 목차 (Table of Contents)  
  
1. [팀원 소개](#technologist-팀원-소개-team-members)
2. [개발 동기](#thought_balloon-개발-동기-motivation)
3. [사용자 인터페이스](#computer-사용자-인터페이스-user-interface)
4. [주요 기능](#hammer_and_wrench-주요-기능-features) 
5. [프로젝트 구조도](#open_file_folder-프로젝트-구조도)
6. [기술 스택](#gear-기술-스택-tech-stack)
7. [브랜치 전략](#pushpin-브랜치-전략-branch-strategy)
<br>

## :technologist: 팀원 소개 (Team Members)

| 김건호 (Keonho Kim) | 남진우 (Jinwoo Nam) |
| :---: | :---: |
| <img src="https://avatars.githubusercontent.com/u/106578297?v=4" alt="image" width="120" height="120" style="border-radius: 50%;" /> | <img src="https://avatars.githubusercontent.com/u/123057930?v=4&size=64" alt="image" width="120" height="120" style="border-radius: 50%;" /> |
| **[주요 기여 내용]** <br/><br/> - Spring Boot 기반 API 서버 설계 <br/> - JWT 기반 인증/인가 구현 <br/> - JPA 최적화 및 DB 설계 <br/> - AWS 배포 환경 구축 | **[주요 기여 내용]** <br/><br/> - Next.js/React 반응형 UI/UX 개발 <br/> - Recoil 전역 상태 관리 <br/> - 백엔드 API 연동 (Axios) <br/> - 레시피 추천/식재료 관리 페이지 |

<br> 
  
##  :thought_balloon: 개발 동기 (Motivation)  
   
  
자취 생활을 하면서 식재료를 효율적으로 관리하는 데 어려움을 겪었습니다. 충동적으로 구매한 식재료가 냉장고 안에서 잊혀 유통기한이 지나 버려지는 경우가 많았고, 막상 요리를 하려고 하면 어떤 재료로 무엇을 만들 수 있을지 막막했습니다.  
  
이러한 **개인적인 경험(Pain Point)**을 해결하고자 본 프로젝트를 시작했습니다. 사용자가 보유한 식재료를 체계적으로 관리하고, 이를 기반으로 만들 수 있는 레시피를 추천함으로써 식재료 낭비를 줄이고 건강한 식생활을 돕는 것을 목표로 했습니다.  
  
이 과정을 통해 **Spring Boot**와 **Next.js**를 연동하는 풀스택 개발 사이클을 경험하고, **JPA**와 **Spring Security** 등 백엔드 핵심 기술에 대한 깊이 있는 학습을 하고자 했습니다.  



  
<br>  



## :computer: 사용자 인터페이스 (User Interface) 

<details>
<summary>👮 사용자 인증</summary>
	
| 기능 | 스크린샷 |
| :---: | :---:  |
| **로그인** | <img width="561" height="715" alt="image" src="https://github.com/user-attachments/assets/4d6d85f0-4024-4460-a898-2eebd4dfea46" /> |
| **회원 가입** | <img width="655" height="795" alt="image" src="https://github.com/user-attachments/assets/cab4a1f2-e27f-4d15-bd88-e956fe0b8f90" />|
| **마이페이지** | <img width="800" height="418" alt="image" src="https://github.com/user-attachments/assets/749e9456-53a3-49e9-8f94-0224d9f7d157" />|
| **비밀번호<br>찾기** | <img width="415" height="356" alt="image" src="https://github.com/user-attachments/assets/46cfc9d1-8c65-429a-81fd-903b5d73af0f" />|
| **이메일<br>인증** |<img width="631" height="401" alt="image" src="https://github.com/user-attachments/assets/c3e27322-ea93-443d-89ef-52a524148746" />|
</details>

<details>
<summary>📜 레시피 공유</summary>
	
| 기능 | 스크린샷 |
| :---: | :---:  |
| **레시피 <br> 커뮤니티** | <img width="800" height="778" alt="image" src="https://github.com/user-attachments/assets/a778382e-8da7-47fd-8a72-a5f34acf099e" />|
| **레시피<br>작성** | <img width="453" height="1213" alt="image" src="https://github.com/user-attachments/assets/773a3861-1d58-4688-a841-6a5d06a43ffa" />|

| **레시피<br>추천** | <img width="800" height="658" alt="image" src="https://github.com/user-attachments/assets/ceb98ea1-2c46-41f9-85f6-1549d400db63" />|<img width="631" height="401" alt="image" src="https://github.com/user-attachments/assets/0c80f998-08de-4b4c-92af-52329932bf37" />|



</details>

<details>
<summary>🥬 식재료 관리</summary>
	
| 기능 | 스크린샷 |
| :---: | :---:  |
| **식재료 <br> 관리** |<img width="800" height="669" alt="image" src="https://github.com/user-attachments/assets/76525b0d-d4fe-4e7d-9072-d26773f0dc1a" />|
| **사용량<br>통계** | <img width="800" height="765" alt="image" src="https://github.com/user-attachments/assets/84cfd5c2-1986-48a9-a92b-e516218e34d0" />|


</details>


<details>
<summary>🙂 고객 지원</summary>
	
| 기능 | 스크린샷 |
| :---: | :---:  |
| **민원 작성** |<img width="800" height="728" alt="image" src="https://github.com/user-attachments/assets/320230cd-1c50-4b68-8fe4-cd7897235b37" />|
| **민원 목록** | <img width="800" height="476" alt="image" src="https://github.com/user-attachments/assets/cf03ae7b-2d91-45e6-867b-de4b48580862" />|


</details>


<details>
<summary>👷 관리자</summary>
	
| 기능 | 스크린샷 |
| :---: | :---:  |
| **관리자<br>대시보드** |<img width="800" height="427" alt="image" src="https://github.com/user-attachments/assets/f08c3f53-0b90-429f-8976-f2ccd61abbbf" />|
| **민원 관리** | <img width="800" height="370" alt="image" src="https://github.com/user-attachments/assets/b43d0eca-da52-4747-b905-d44daa0c5495" />|
| **카테고리<br>관리** | <img width="800" height="270" alt="image" src="https://github.com/user-attachments/assets/c2e807f5-b247-40ba-b8b2-84468b8e34bd" />|
| **식재료<br>관리** |<img width="800" height="367" alt="image" src="https://github.com/user-attachments/assets/e6d97692-ed18-4b3a-af20-9dd81fdb3715" />|
| **사용자<br>관리** |<img width="800" height="204" alt="image" src="https://github.com/user-attachments/assets/304dbd1c-247b-4e48-a968-21d2b19cb906" />|


</details>

<details>
<summary>✅ 부가기능</summary>
	
| 기능 | 스크린샷 |
| :---: | :---:  |
| **식단 관리** |<img width="800" height="544" alt="image" src="https://github.com/user-attachments/assets/3266d928-2437-4548-9fc4-c197ec4ec70d" />|
| **알림** |<img width="588" height="360" alt="image" src="https://github.com/user-attachments/assets/c4e79bba-a4fa-4b1a-a4e8-a58489d043d4" />|


</details>

<br>
  
## :hammer_and_wrench: 주요 기능 (Features)  
  

-   :cucumber:**식재료 관리**
	- 구매한 식재료의 정보를 간편하게 관리하고, 필터를 통해 쉽게 확인
	- 통계 페이지를 통해 사용한 식재료의 통계 정보를 간편하게 확인
-   :calendar:**유통기한 알림**
	- 유통기한이 임박한 식재료의 정보를 대시보드를 통해 확인
-   :green_salad:**레시피 추천**: 
	- 보유한 식재료를 기반으로 조리 가능한 레시피 목록을 추천
	- 좋아요 순으로 정렬되어 인기있는 레시피 확인 가능
-   :speech_balloon:**레시피 공유**
	-  레시피 커뮤니티를 통해 수많은 레시피를 공유
-   🥗 **식단 캘린더**
  	-  식단 캘린더를 통해 이번달에 먹은 식단을 한눈에 확인
  	-  통계 페이지에서 기간별 섭취 칼로리 편차를 간편하게 확인
-   👷‍♂️ **관리자 기능**
  	-  관리자 전용 페이지를 통해 간편하게 민원, 식재료 및 카테고리, 사용자를 관리
  	

  <br>  


## :gear: 기술 스택 (Tech Stack)  
  
### Backend  
![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![JPA(Hibernate)](https://img.shields.io/badge/JPA(Hibernate)-59666C?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
  
### Frontend  
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)  
  
### Deployment  
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS EC2](https://img.shields.io/badge/AWS%20EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS%20S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white)
  
<br>  
  
  
  ## :open_file_folder: 프로젝트 구조도

### :floppy_disk: Backend (src)

<details>
<summary>백엔드 구조도</summary>

```
📦main  
 ┣ 📂java  
 ┃ ┗ 📂com  
 ┃    ┗ 📂example  
 ┃       ┗ 📂ingredients_ms  
 ┃          ┣ 📂config  
 ┃          ┃ ┣ 📜ApiSecurityConfig.java  
 ┃          ┃ ┣ 📜EmailConfig.java  
 ┃          ┃ ┣ 📜RedisConfig.java  
 ┃          ┃ ┣ 📜S3Config.java  
 ┃          ┃ ┣ 📜SecurityConfig.java  
 ┃          ┃ ┣ 📜SwaggerConfig.java  
 ┃          ┃ ┗ 📜WebConfig.java  
 ┃          ┣ 📂domain  
 ┃          ┃ ┣ 📂cart  
 ┃          ┃ ┣ 📂cartitem  
 ┃          ┃ ┣ 📂complaint  
 ┃          ┃ ┣ 📂consumedlog  
 ┃          ┃ ┣ 📂diet  
 ┃          ┃ ┣ 📂email  
 ┃          ┃ ┣ 📂feedback  
 ┃          ┃ ┣ 📂foodinventory  
 ┃          ┃ ┣ 📂image  
 ┃          ┃ ┣ 📂ingredients  
 ┃          ┃ ┣ 📂ingredientscategory  
 ┃          ┃ ┣ 📂recipe  
 ┃          ┃ ┣ 📂recipeingredient   
 ┃          ┃ ┣ 📂recipelike  
 ┃          ┃ ┣ 📂reciperecommendation   
 ┃          ┃ ┣ 📂recipestep   
 ┃          ┃ ┣ 📂user  
 ┃          ┃ ┗ 📂useractivity    
 ┃          ┣ 📂global  
 ┃          ┃ ┣ 📂alarm  
 ┃          ┃ ┣ 📂app  
 ┃          ┃ ┣ 📂entity  
 ┃          ┃ ┣ 📂exeption  
 ┃          ┃ ┣ 📂init   
 ┃          ┃ ┣ 📂initdata   
 ┃          ┃ ┣ 📂jwt  
 ┃          ┃ ┣ 📂redis  
 ┃          ┃ ┃ ┗ 📂util  
 ┃          ┃ ┣ 📂rsdata  
 ┃          ┃ ┣ 📂security  
 ┃          ┃ ┃ ┣ 📂oauth  
 ┃          ┃ ┣ 📂util  
 ┃          ┃ ┗ 📜Status.java  
 ┃          ┗ 📜IngredientsMsApplication.java  
 ┗ 📂resources  
    ┣ 📂data  
    ┃ ┗ 📜ingredients.json  
    ┣ 📂db  
    ┃ ┗ 📂migration  
    ┣ 📂templates  
    ┣ 📜application-dev.yml  
    ┣ 📜application-prod.yml  
    ┣ 📜application-secret.yml  
    ┣ 📜application-secret.yml.default  
    ┣ 📜application-test.yml  
    ┗ 📜application.yml
```

</details>

### 🖥️ Frontend (src)

<details>
<summary>프론트 구조도</summary>
	

```
📦src  
 ┣ 📂app  
 ┃ ┣ 📂access-denied  
 ┃ ┣ 📂admin  
 ┃ ┃ ┣ 📂categories  
 ┃ ┃ ┣ 📂complaints  
 ┃ ┃ ┃ ┗ 📂components  
 ┃ ┃ ┣ 📂components  
 ┃ ┃ ┃ ┗ 📜sidebar.tsx  
 ┃ ┃ ┣ 📂feedback  
 ┃ ┃ ┣ 📂ingredients  
 ┃ ┃ ┣ 📂login  
 ┃ ┃ ┣ 📂statistics  
 ┃ ┃ ┗ 📂user  
 ┃ ┃    ┗ 📂controll  
 ┃ ┣ 📂callender  
 ┃ ┣ 📂components  
 ┃ ┃ ┣ 📂layout  
 ┃ ┃ ┃ ┣ 📜Footer.tsx  
 ┃ ┃ ┃ ┗ 📜Header.tsx  
 ┃ ┃ ┗ 📂ui  
 ┃ ┃    ┣ 📜ImageCropModal.tsx  
 ┃ ┃    ┣ 📜ImageUpload.tsx  
 ┃ ┃    ┣ 📜IngredientInput.tsx  
 ┃ ┃    ┣ 📜PageHeader.tsx  
 ┃ ┃    ┗ 📜SectionCard.tsx  
 ┃ ┣ 📂inventory  
 ┃ ┃ ┗ 📂components  
 ┃ ┣ 📂login  
 ┃ ┣ 📂mypage  
 ┃ ┃ ┗ 📂change-password  
 ┃ ┣ 📂recipe-community  
 ┃ ┣ 📂recipe-recommendation 
 ┃ ┣ 📂recipes  
 ┃ ┣ 📂signup  
 ┃ ┣ 📂statistics  
 ┃ ┣ 📂stores  
 ┃ ┃ ┗ 📂auth  
 ┃ ┣ 📂support  
 ┃ ┣ 📂test  
 ┃ ┣ 📜.prettierrc  
 ┃ ┣ 📜ClientLayout.tsx  
 ┃ ┣ 📜favicon.ico  
 ┃ ┣ 📜globals.css  
 ┃ ┣ 📜layout.tsx  
 ┃ ┗ 📜page.tsx  
 ┗ 📂lib  
    ┣ 📂api  
    ┃ ┣ 📂services  
    ┃ ┣ 📜client.ts  
    ┃ ┗ 📜endpoints.ts  
    ┣ 📂auth  
    ┃ ┣ 📜adminGuard.tsx  
    ┃ ┗ 📜authGuard.tsx  
    ┣ 📂backend  
    ┃ ┗ 📂apiV1  
    ┃    ┣ 📜complaintTypes.ts  
    ┃    ┗ 📜schema.d.ts  
    ┣ 📂constants  
    ┃ ┣ 📜colors.ts  
    ┃ ┗ 📜README.md  
    ┣ 📂hooks  
    ┃ ┗ 📜useNotifications.ts  
    ┗ 📂utils
```
</details>



<br>  

## :pushpin: 브랜치 전략 (Branch Strategy)


-   Git-Flow 전략

### 📝기능 브랜치 형식

-   `master`
-   `feat/{issue-number}-{feature-name}`

> **예시:**
> `feat/#24-complaint-feedback-CRUD`

| 브랜치 | 설명 |
| :--- | :--- |
| **main** | 제품 출시용 안정화 브랜치 |
| **develop** | 통합 개발 브랜치 (기능 병합 후 테스트) |
| **feat/\*** | 기능 개발 브랜치 (develop에서 분기) |
| **front/\*** | 프론트 개발 및 연동 브랜치 (develop에서 분기) |

<br>


## 📍 커밋 메시지 컨벤션

### 📝 커밋 메시지 형식

<타입>: <이슈번호(optional)> <변경 요약>


> **예시:**
> `Feat: #21 시설별 이용 횟수 통계`

### ✅ 커밋 타입 목록

| 타입 | 설명 |
| :--- | :--- |
| **feat** | 새로운 기능 추가 |
| **fix** | 버그 수정 |
| **style** | 코드 포맷 수정 (세미콜론 등) |
| **refactor** | 리팩토링 (기능 변경 없음) |
| **test** | 테스트 코드 추가/수정 |
| **chore** | 빌드 설정, 패키지 등 기타 변경 |
| **remove** | 사용하지 않는 코드/파일 제거 |
| **rename** | 파일 또는 폴더명 변경 |
 
