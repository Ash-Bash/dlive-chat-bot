import { first, filter, switchMap, mergeMap, map, tap } from 'rxjs/operators';
// import {
//   firebaseUsers$
// } from './firebase';
import { isEmpty, differenceWith, isEqual } from 'lodash';
import { rxFirebaseuser, firestore } from './firebase';
import { collectionData } from 'rxfire/firestore';
import { BehaviorSubject } from 'rxjs';

const Window: any = window;
const { ipcRenderer } = Window.require('electron');

// const rxUsers = new BehaviorSubject({});
ipcRenderer.send('getRxUsers');
ipcRenderer.on('rxUsers', (event, users) => {
  setRxUsers(users);
});

export const firebaseUsers$ = new BehaviorSubject({ first: true });

rxFirebaseuser
  .pipe(
    filter(x => !isEmpty(x)),
    mergeMap((user: any) => {
      return collectionData(
        firestore
          .collection('users')
          .doc(user.uid)
          .collection('users')
      )
        .pipe(tap(x => console.log(`TAP Users: ${x}`)))
        .pipe(
          map(arr =>
            arr.reduce((acc, user: any) => {
              acc[user.blockchainUsername] = user;
              return acc;
            }, {})
          )
        );
    })
  )
  .subscribe((data: any) => firebaseUsers$.next(data));

firebaseUsers$.subscribe(users => {
  if (users.first === true) return;
  ipcRenderer.send('setRxUsers', users);
});

export const setRxUsers = users => {
  rxFirebaseuser
    .pipe(
      filter(x => !isEmpty(x)),
      first()
    )
    .subscribe((rxUser: any) => {
      firebaseUsers$
        .pipe(
          first(),
          filter(x => !isEmpty(x))
        )
        .subscribe(firebaseUsers => {
          let newUsersIncoming = differenceWith(
            Object.keys(users),
            Object.keys(firebaseUsers),
            (var1, var2) => {
              return isEqual(users[var1], firebaseUsers[var2]);
            }
          );
          let deleteUsersIncoming = differenceWith(
            Object.keys(firebaseUsers),
            Object.keys(users),
            (var1, var2) => {
              return isEqual(firebaseUsers[var1], users[var2]);
            }
          );
          let sameArr = [];
          deleteUsersIncoming = deleteUsersIncoming.reduce((acc, key) => {
            if (newUsersIncoming.includes(key)) {
              sameArr.push(key);
            } else {
              acc.push(key);
            }
            return acc;
          }, []);
          newUsersIncoming = newUsersIncoming.reduce((acc, key) => {
            if (!sameArr.includes(key)) {
              acc.push(key);
            }
            return acc;
          }, []);

          let batch = firestore.batch();
          let update = false;
          let updated = 0;
          let deleted = 0;
          let created = 0;
          deleteUsersIncoming.forEach(key => {
            let ref = firestore
              .collection('users')
              .doc(rxUser.uid)
              .collection('users')
              .doc(key);
            batch.delete(ref);
            update = true;
            deleted++;
          });
          newUsersIncoming.forEach(key => {
            let ref = firestore
              .collection('users')
              .doc(rxUser.uid)
              .collection('users')
              .doc(key);
            batch.set(ref, users[key]);
            update = true;
            created++;
          });
          sameArr.forEach(key => {
            let ref = firestore
              .collection('users')
              .doc(rxUser.uid)
              .collection('users')
              .doc(key);
            batch.update(ref, users[key]);
            updated++;
            update = true;
          });
          if (update) {
            console.log(
              `Users (New: ${created}) (Deleted: ${deleted}) (Updated: ${updated})`
            );
            batch.commit();
          }
        });
    });
};
