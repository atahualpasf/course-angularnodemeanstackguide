import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Post } from './post.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const BACKEND_URL = environment.apiUrl + '/posts';

@Injectable({providedIn: 'root'})
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

    constructor(private http: HttpClient, private router: Router) {}

    getPosts(postsPerPage: number, currentPage: number) {
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http
            .get<{message: string, posts: any, maxPosts: number}>(BACKEND_URL + queryParams)
            .pipe(map((postData) => {
                return { posts: postData.posts.map(post => {
                    return {
                        id: post._id,
                        title: post.title,
                        content: post.content,
                        imagePath: post.imagePath,
                        creator: post.creator
                    };
                }), maxPosts: postData.maxPosts};
            }))
            .subscribe((transformedPostsData) => {
                this.posts = transformedPostsData.posts;
                this.postsUpdated.next({
                    posts: [...this.posts],
                    postCount: transformedPostsData.maxPosts
                });
            });
    }

    getPostUpdatedListener(): Observable<{posts: Post[], postCount: number}> {
        return this.postsUpdated.asObservable();
    }

    getPost(id: string) {
        return this.http
            .get<{_id: string, title: string, content: string, imagePath: string, creator: string}>
            (BACKEND_URL + '/' + id);
    }

    addPost(title: string, content: string, image: File) {
        const postData = new FormData();
        postData.append('title', title);
        postData.append('content', content);
        postData.append('image', image, title);
        this.http
            .post<{message: string, post: Post}>(BACKEND_URL, postData)
            .subscribe(() => this.router.navigate(['/']) );
    }

    updatePost(id: string, title: string, content: string, image: File | string) {
        let postData: FormData | Post;
        if (typeof(image) === 'object') {
            postData = new FormData();
            postData.append('id', id);
            postData.append('title', title);
            postData.append('content', content);
            postData.append('image', image, title);
        } else {
            postData = {
                id: id,
                title: title,
                content: content,
                imagePath: image,
                creator: null
            };
        }
        this.http
            .put(BACKEND_URL + '/' + id, postData)
            .subscribe(() => this.router.navigate(['/']) );
    }

    deletePost(postId: string) {
        return this.http.
            delete(BACKEND_URL + '/' + postId);
    }
}
