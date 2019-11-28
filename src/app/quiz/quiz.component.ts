import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '../shared/quiz.service';
import {Participant} from '../register/Participant';
import {Question} from '../shared/Question';
import {RegisterComponent} from '../register/register.component';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import{map} from 'rxjs/operators';
import { DragndropquizComponent } from '../dragndropquiz/dragndropquiz.component';

interface User{
  Name : string;
  email: string;
  Score: number;
  Scorefordrag: number;
}
 
@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'] ,
  providers: [RegisterComponent , DragndropquizComponent]
})

export class QuizComponent implements OnInit {

  participant = new Participant();
   question = new Question();
  questionsCol: AngularFirestoreCollection<Question>;
  participantsCol: AngularFirestoreCollection<Participant>;

   questions: any;
   participants: any;
     correctAnswerCount: number = 0;
   qnProgress: number;
   
   optionss: any;
   usersCol: AngularFirestoreCollection<User>;
   users: any;
   userCol: AngularFirestoreCollection<User>;
   use: any;
   correct: string = '';

   
  constructor(private router: Router, 
    private registercomponent : RegisterComponent,
    private quizService: QuizService,
    private afs: AngularFirestore ,
    private dragndropcomponent : DragndropquizComponent) { }

  
  ngOnInit(){
    this.quizService.qnProgress = parseInt(localStorage.getItem('qnProgress'));
    this.questionsCol = this.afs.collection('Question');
    this.questions = this.questionsCol.snapshotChanges()
    .pipe(
        map(actions => {
            return actions.map(a => {
                const data = a.payload.doc.data() as Question;
                const id = a.payload.doc.id;
                return{id, data};

            });
        })
    );   
    this.usersCol = this.afs.collection('users/' + this.quizService.loggedInUser + "/clients/");
    this.users = this.usersCol.snapshotChanges()
    .pipe(
        map(actions => {
            return actions.map(a => {
                const data = a.payload.doc.data() as User;
                const id = a.payload.doc.id;
                return{id, data};
               
            });
        })
    );
    this.userCol = this.afs.collection('users');
    this.use = this.usersCol.get().toPromise()
    .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
    });
  });
    this.optionss = this.question.Option;
 }

 restart() {
  clearInterval(this.correctAnswerCount);
  this.router.navigate(['/drag']);
 }

 close(){
  localStorage.setItem('correctAnswerCount', "0");
 }

 submitanswer(){ 
  this.afs.collection('users')
  .doc(this.quizService.loggedInUser)
  .collection("clients")
  .add({
      Score: this.correctAnswerCount,
      Scorefordrag: this.dragndropcomponent.correctAnswerCountfordrag
   });    
}
 
  Answer( qID , choice) { 
    if (qID ==  choice) { 
     this.correctAnswerCount++;
     if (this.correctAnswerCount >= 5) {
      this.correct = 'Bravo';
    }
    else if (this.correctAnswerCount >= 3) {
      this.correct = 'Not Bad';

    }
    else if (this.correctAnswerCount >= 1) {
      this.correct = 'Try once Again';
      console.log(this.correct);
    }
     console.log('correct' + this.correctAnswerCount);
     }
    else{
      console.log('incorrect' );
    }
  }


}